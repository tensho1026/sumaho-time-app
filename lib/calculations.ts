import { addDays, format, isAfter, startOfDay } from "date-fns";

export type ComparisonType = "yesterday" | "weekAvg" | "best";

export type ComparisonBaseInput = {
  comparison: ComparisonType;
  fallbackMinutes: number;
  yesterdayMinutes?: number | null;
  weekAverageMinutes?: number | null;
  bestMinutes?: number | null;
};

export type StreakItem = {
  date: Date;
  actualMinutes: number;
  targetMinutes: number;
};

export function normalizeDate(date: Date): Date {
  return startOfDay(date);
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function resolveComparisonBase({
  comparison,
  fallbackMinutes,
  yesterdayMinutes,
  weekAverageMinutes,
  bestMinutes,
}: ComparisonBaseInput): number {
  const fallback = fallbackMinutes > 0 ? fallbackMinutes : 1;

  if (comparison === "yesterday") {
    return yesterdayMinutes && yesterdayMinutes > 0 ? yesterdayMinutes : fallback;
  }

  if (comparison === "weekAvg") {
    return weekAverageMinutes && weekAverageMinutes > 0 ? weekAverageMinutes : fallback;
  }

  if (comparison === "best") {
    return bestMinutes && bestMinutes > 0 ? bestMinutes : fallback;
  }

  return fallback;
}

export function calculateReductionMetrics(comparisonBase: number, actualMinutes: number) {
  const base = comparisonBase > 0 ? comparisonBase : 1;
  const reducedMinutes = base - actualMinutes;
  const reductionRate = reducedMinutes / base;

  return {
    reducedMinutes,
    reductionRate,
  };
}

export function calculateAverage(minutes: number[]): number {
  if (minutes.length === 0) {
    return 0;
  }

  const sum = minutes.reduce((acc, value) => acc + value, 0);
  return sum / minutes.length;
}

export function calculateStreakDays(items: StreakItem[], today: Date): number {
  if (items.length === 0) {
    return 0;
  }

  const normalizedToday = normalizeDate(today);
  const itemMap = new Map(items.map((item) => [toDateKey(normalizeDate(item.date)), item]));

  let currentDate = normalizedToday;
  let streak = 0;

  while (!isAfter(currentDate, normalizedToday)) {
    const key = toDateKey(currentDate);
    const item = itemMap.get(key);

    if (!item) {
      break;
    }

    if (item.actualMinutes <= item.targetMinutes) {
      streak += 1;
      currentDate = addDays(currentDate, -1);
      continue;
    }

    break;
  }

  return streak;
}

export type MonthlyChartPoint = {
  isoDate: string;
  label: string;
  actualMinutes: number | null;
  targetMinutes: number | null;
};

export function buildMonthlyChartData(
  items: StreakItem[],
  monthStart: Date,
  monthEnd: Date,
): MonthlyChartPoint[] {
  const itemMap = new Map(items.map((item) => [toDateKey(normalizeDate(item.date)), item]));
  const result: MonthlyChartPoint[] = [];

  let cursor = normalizeDate(monthStart);
  const end = normalizeDate(monthEnd);

  while (!isAfter(cursor, end)) {
    const key = toDateKey(cursor);
    const item = itemMap.get(key);

    result.push({
      isoDate: key,
      label: format(cursor, "d"),
      actualMinutes: item?.actualMinutes ?? null,
      targetMinutes: item?.targetMinutes ?? null,
    });

    cursor = addDays(cursor, 1);
  }

  return result;
}
