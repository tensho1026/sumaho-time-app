"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyChartPoint = {
  isoDate: string;
  label: string;
  actualMinutes: number | null;
  targetMinutes: number | null;
};

type MonthlyChartProps = {
  data: MonthlyChartPoint[];
};

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>月間スクリーンタイム推移</CardTitle>
        <CardDescription>今月の日別利用時間（分）</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value, name) => {
                  if (value === null || value === undefined) {
                    return ["未記録", name];
                  }
                  if (typeof value === "number") {
                    return [`${Math.round(value)} 分`, name];
                  }
                  return [String(value), name];
                }}
                labelFormatter={(value) => `${value}日`}
              />
              <Line
                type="monotone"
                dataKey="actualMinutes"
                stroke="#0f766e"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="実利用"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="targetMinutes"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                name="目標"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
