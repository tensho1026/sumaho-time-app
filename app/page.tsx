import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <Card className="w-full max-w-2xl rounded-xl border-slate-200">
        <CardHeader className="space-y-4 text-center">
          <p className="text-sm font-medium text-teal-700">MVP</p>
          <CardTitle className="text-3xl">スクリーンタイム削減管理アプリ</CardTitle>
          <CardDescription className="text-base">
            今日の目標と実利用時間を記録し、削減率・月間推移・連続達成日数を確認できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          {userId ? (
            <>
              <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-muted-foreground">ログイン中</span>
              </div>
              <Button asChild size="lg" className="rounded-lg bg-teal-700 px-8 hover:bg-teal-800">
                <Link href="/dashboard">ダッシュボードへ</Link>
              </Button>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SignInButton mode="modal">
                <Button size="lg" className="rounded-lg bg-teal-700 px-8 hover:bg-teal-800">
                  ログイン
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline" className="rounded-lg px-8">
                  新規登録
                </Button>
              </SignUpButton>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
