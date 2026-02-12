"use server";

import { auth } from "@clerk/nextjs/server";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  buildMonthlyChartData,
  calculateAverage,
  calculateReductionMetrics,
  calculateStreakDays,
  normalizeDate,
  resolveComparisonBase,
  type ComparisonType,
} from "@/lib/calculations";
import { prisma } from "@/lib/prisma";

const saveDailyUsageSchema = z.object({
  targetMinutes: z.coerce.number().int().min(1).max(24 * 60),
  actualMinutes: z.coerce.number().int().min(0).max(24 * 60),
  comparison: z.enum(["yesterday", "weekAvg", "best"]),
});

export type SaveDailyUsageState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export type DashboardData = {
  today: {
    actualMinutes: number;
    targetMinutes: number;
    reducedMinutes: number;
    reductionRate: number;
  };
  comparisons: {
    yesterday: number;
    weekAvg: number;
    best: number;
  };
  monthAverage: number;
  streakDays: number;
  monthlyData: Array<{
    isoDate: string;
    label: string;
    actualMinutes: number | null;
    targetMinutes: number | null;
  }>;
};

async function requireInternalUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: { clerkUserId: userId },
    select: { id: true },
  });

  return user.id;
}

async function getComparisonInputs(userId: string, today: Date, comparison: ComparisonType) {
  if (comparison === "yesterday") {
    const yesterday = addDays(today, -1);

    const yesterdayUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: yesterday,
        },
      },
      select: { actualMinutes: true },
    });

    return {
      yesterdayMinutes: yesterdayUsage?.actualMinutes ?? null,
    };
  }

  if (comparison === "weekAvg") {
    const weekStart = addDays(today, -7);

    const weekData = await prisma.dailyUsage.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: today,
        },
      },
      select: { actualMinutes: true },
    });

    return {
      weekAverageMinutes: calculateAverage(weekData.map((item) => item.actualMinutes)),
    };
  }

  const bestUsage = await prisma.dailyUsage.findFirst({
    where: {
      userId,
      date: {
        lt: today,
      },
    },
    orderBy: {
      actualMinutes: "asc",
    },
    select: {
      actualMinutes: true,
    },
  });

  return {
    bestMinutes: bestUsage?.actualMinutes ?? null,
  };
}

export async function saveDailyUsage(
  _: SaveDailyUsageState,
  formData: FormData,
): Promise<SaveDailyUsageState> {
  const parsed = saveDailyUsageSchema.safeParse({
    targetMinutes: formData.get("targetMinutes"),
    actualMinutes: formData.get("actualMinutes"),
    comparison: formData.get("comparison"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireInternalUserId();
    const today = normalizeDate(new Date());

    const { targetMinutes, actualMinutes, comparison } = parsed.data;

    const comparisonInputs = await getComparisonInputs(userId, today, comparison);
    const comparisonBase = resolveComparisonBase({
      comparison,
      fallbackMinutes: targetMinutes,
      ...comparisonInputs,
    });

    const { reducedMinutes, reductionRate } = calculateReductionMetrics(comparisonBase, actualMinutes);

    await prisma.dailyUsage.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      create: {
        userId,
        date: today,
        actualMinutes,
        targetMinutes,
        reducedMinutes,
        reductionRate,
      },
      update: {
        actualMinutes,
        targetMinutes,
        reducedMinutes,
        reductionRate,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "今日の利用時間を保存しました。",
    };
  } catch (error) {
    console.error("saveDailyUsage failed", error);

    return {
      success: false,
      message: "保存に失敗しました。時間を空けて再試行してください。",
    };
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await requireInternalUserId();

  const today = normalizeDate(new Date());
  const yesterday = addDays(today, -1);
  const weekStart = addDays(today, -7);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const [todayUsage, yesterdayUsage, weekData, bestUsage, monthData, streakData] = await Promise.all([
    prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      select: {
        actualMinutes: true,
        targetMinutes: true,
        reducedMinutes: true,
        reductionRate: true,
      },
    }),
    prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: yesterday,
        },
      },
      select: {
        actualMinutes: true,
      },
    }),
    prisma.dailyUsage.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: today,
        },
      },
      select: {
        actualMinutes: true,
      },
    }),
    prisma.dailyUsage.findFirst({
      where: {
        userId,
        date: {
          lt: today,
        },
      },
      orderBy: {
        actualMinutes: "asc",
      },
      select: {
        actualMinutes: true,
      },
    }),
    prisma.dailyUsage.findMany({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        date: true,
        actualMinutes: true,
        targetMinutes: true,
      },
    }),
    prisma.dailyUsage.findMany({
      where: {
        userId,
        date: {
          lte: today,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        date: true,
        actualMinutes: true,
        targetMinutes: true,
      },
    }),
  ]);

  const weekAvg = calculateAverage(weekData.map((item) => item.actualMinutes));
  const monthAvg = calculateAverage(monthData.map((item) => item.actualMinutes));
  const streakDays = calculateStreakDays(streakData, today);

  const todayActual = todayUsage?.actualMinutes ?? 0;
  const comparisonFallback = todayUsage?.targetMinutes ?? (todayActual > 0 ? todayActual : 120);

  const comparisons = {
    yesterday: resolveComparisonBase({
      comparison: "yesterday",
      fallbackMinutes: comparisonFallback,
      yesterdayMinutes: yesterdayUsage?.actualMinutes ?? null,
    }),
    weekAvg: resolveComparisonBase({
      comparison: "weekAvg",
      fallbackMinutes: comparisonFallback,
      weekAverageMinutes: weekAvg,
    }),
    best: resolveComparisonBase({
      comparison: "best",
      fallbackMinutes: comparisonFallback,
      bestMinutes: bestUsage?.actualMinutes ?? null,
    }),
  };

  return {
    today: {
      actualMinutes: todayUsage?.actualMinutes ?? 0,
      targetMinutes: todayUsage?.targetMinutes ?? 120,
      reducedMinutes: todayUsage?.reducedMinutes ?? 0,
      reductionRate: todayUsage?.reductionRate ?? 0,
    },
    comparisons,
    monthAverage: monthAvg,
    streakDays,
    monthlyData: buildMonthlyChartData(monthData, monthStart, today),
  };
}
