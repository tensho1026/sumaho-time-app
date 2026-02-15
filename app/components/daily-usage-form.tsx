"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { saveDailyUsage, type SaveDailyUsageState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  targetHours: z.number().int().min(0).max(24),
  targetMinutesPart: z.number().int().min(0).max(59),
  actualHours: z.number().int().min(0).max(24),
  actualMinutesPart: z.number().int().min(0).max(59),
  comparison: z.enum(["yesterday", "weekAvg", "best"]),
}).superRefine((values, ctx) => {
  const targetTotalMinutes = values.targetHours * 60 + values.targetMinutesPart;
  const actualTotalMinutes = values.actualHours * 60 + values.actualMinutesPart;

  if (targetTotalMinutes < 1 || targetTotalMinutes > 24 * 60) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["targetMinutesPart"],
      message: "目標時間は 0時間1分 〜 24時間0分 で入力してください",
    });
  }

  if (actualTotalMinutes < 0 || actualTotalMinutes > 24 * 60) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["actualMinutesPart"],
      message: "実利用時間は 0時間0分 〜 24時間0分 で入力してください",
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

type DailyUsageFormProps = {
  defaultValues: {
    targetMinutes: number;
    actualMinutes: number;
    comparison: "yesterday" | "weekAvg" | "best";
  };
};

const initialSaveDailyUsageState: SaveDailyUsageState = {
  success: false,
  message: "",
};

export function DailyUsageForm({ defaultValues }: DailyUsageFormProps) {
  const [serverState, action] = useActionState<SaveDailyUsageState, FormData>(
    saveDailyUsage,
    initialSaveDailyUsageState,
  );
  const [isPending, startTransition] = useTransition();

  const initialValues: FormValues = {
    targetHours: Math.floor(defaultValues.targetMinutes / 60),
    targetMinutesPart: defaultValues.targetMinutes % 60,
    actualHours: Math.floor(defaultValues.actualMinutes / 60),
    actualMinutesPart: defaultValues.actualMinutes % 60,
    comparison: defaultValues.comparison,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const targetMinutes = values.targetHours * 60 + values.targetMinutesPart;
    const actualMinutes = values.actualHours * 60 + values.actualMinutesPart;

    const formData = new FormData();
    formData.set("targetMinutes", String(targetMinutes));
    formData.set("actualMinutes", String(actualMinutes));
    formData.set("comparison", values.comparison);

    startTransition(() => {
      action(formData);
    });
  });

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>今日の記録入力</CardTitle>
        <CardDescription>目標・実利用を「時間」と「分」で入力して保存します。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormItem>
              <p className="text-sm font-medium">目標時間</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="targetHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">時間</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={24}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetMinutesPart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">分</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {serverState.errors?.targetMinutes?.[0] ? (
                <p className="text-sm text-destructive">{serverState.errors.targetMinutes[0]}</p>
              ) : null}
            </FormItem>

            <FormItem>
              <p className="text-sm font-medium">実利用時間</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="actualHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">時間</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={24}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualMinutesPart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">分</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {serverState.errors?.actualMinutes?.[0] ? (
                <p className="text-sm text-destructive">{serverState.errors.actualMinutes[0]}</p>
              ) : null}
            </FormItem>

            <FormField
              control={form.control}
              name="comparison"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>比較基準</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="比較基準を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yesterday">昨日</SelectItem>
                      <SelectItem value="weekAvg">7日平均</SelectItem>
                      <SelectItem value="best">自己ベスト</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    削減時間・削減率の計算に使う比較値を選びます。
                  </FormDescription>
                  <FormMessage />
                  {serverState.errors?.comparison?.[0] ? (
                    <p className="text-sm text-destructive">{serverState.errors.comparison[0]}</p>
                  ) : null}
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "保存中..." : "保存する"}
            </Button>
          </form>
        </Form>

        {serverState.message ? (
          <p className={`mt-4 text-sm ${serverState.success ? "text-green-600" : "text-red-600"}`}>
            {serverState.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
