import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardCardsProps = {
  todayMinutes: number;
  targetDiffMinutes: number;
  monthAverageMinutes: number;
  streakDays: number;
};

function formatSignedMinutes(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} 分`;
}

export function DashboardCards({
  todayMinutes,
  targetDiffMinutes,
  monthAverageMinutes,
  streakDays,
}: DashboardCardsProps) {
  const diffColor = targetDiffMinutes >= 0 ? "text-green-600" : "text-red-600";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">今日の使用時間</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight">{Math.round(todayMinutes)} 分</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">目標との差分</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-4xl font-semibold tracking-tight ${diffColor}`}>
            {formatSignedMinutes(targetDiffMinutes)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">今月平均</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight">{Math.round(monthAverageMinutes)} 分</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">連続達成日数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight text-green-600">{streakDays} 日</p>
        </CardContent>
      </Card>
    </section>
  );
}
