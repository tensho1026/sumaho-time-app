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
  targetMinutes: z.number().int().min(1, "1分以上を入力してください").max(24 * 60),
  actualMinutes: z.number().int().min(0, "0分以上を入力してください").max(24 * 60),
  comparison: z.enum(["yesterday", "weekAvg", "best"]),
});

type FormValues = z.infer<typeof formSchema>;

type DailyUsageFormProps = {
  defaultValues: FormValues;
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    formData.set("targetMinutes", String(values.targetMinutes));
    formData.set("actualMinutes", String(values.actualMinutes));
    formData.set("comparison", values.comparison);

    startTransition(() => {
      action(formData);
    });
  });

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>今日の記録入力</CardTitle>
        <CardDescription>目標・実利用・比較基準を入力して保存します。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="targetMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目標時間（分）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={24 * 60}
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  {serverState.errors?.targetMinutes?.[0] ? (
                    <p className="text-sm text-destructive">{serverState.errors.targetMinutes[0]}</p>
                  ) : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>実利用時間（分）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={24 * 60}
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                  {serverState.errors?.actualMinutes?.[0] ? (
                    <p className="text-sm text-destructive">{serverState.errors.actualMinutes[0]}</p>
                  ) : null}
                </FormItem>
              )}
            />

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
