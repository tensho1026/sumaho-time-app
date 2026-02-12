import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DailyUsageForm } from "@/app/components/daily-usage-form";
import { DashboardCards } from "@/app/components/dashboard-cards";
import { MonthlyChart } from "@/app/components/monthly-chart";
import { getDashboardData } from "@/app/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getDashboardData();
  const targetDiffMinutes = data.today.targetMinutes - data.today.actualMinutes;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">スクリーンタイム削減ダッシュボード</h1>
        <p className="text-muted-foreground">
          目標を立てて毎日の利用時間を記録し、削減状況を可視化します。
        </p>
      </section>

      <DashboardCards
        todayMinutes={data.today.actualMinutes}
        targetDiffMinutes={targetDiffMinutes}
        monthAverageMinutes={data.monthAverage}
        streakDays={data.streakDays}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <DailyUsageForm
          defaultValues={{
            targetMinutes: data.today.targetMinutes,
            actualMinutes: data.today.actualMinutes,
            comparison: "yesterday",
          }}
        />

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>比較指標</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">昨日</span>
              <span className="font-medium">{Math.round(data.comparisons.yesterday)} 分</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">7日平均</span>
              <span className="font-medium">{Math.round(data.comparisons.weekAvg)} 分</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">自己ベスト</span>
              <span className="font-medium">{Math.round(data.comparisons.best)} 分</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">今日の削減時間</span>
              <span className={data.today.reducedMinutes >= 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                {data.today.reducedMinutes > 0 ? "+" : ""}
                {Math.round(data.today.reducedMinutes)} 分
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">今日の削減率</span>
              <span className={data.today.reductionRate >= 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                {data.today.reductionRate > 0 ? "+" : ""}
                {formatPercent(data.today.reductionRate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <MonthlyChart data={data.monthlyData} />
    </main>
  );
}
