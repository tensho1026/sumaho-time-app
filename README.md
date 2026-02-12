# スクリーンタイム削減管理アプリ (MVP)

Next.js App Router + Server Actions + Prisma + PostgreSQL + Clerk + shadcn/ui で作成した MVP です。

## 技術スタック

- Next.js (App Router)
- Server Actions（API Routes 未使用）
- Prisma
- PostgreSQL
- Clerk
- shadcn/ui（Card / Form / Input / Select / Button）
- TypeScript
- Tailwind CSS
- Recharts

## セットアップ

1. 依存インストール

```bash
npm install
```

2. 環境変数を設定

`.env.example` を `.env` にコピーして値を設定してください。

```bash
cp .env.example .env
```

3. Prisma Client 生成 + DB 反映

```bash
npm run prisma:generate
npm run db:push
```

4. 開発サーバー起動

```bash
npm run dev
```

## 主要実装

- `prisma/schema.prisma`
  - `User`（Clerk `userId` 紐付け）
  - `DailyUsage`（`@@unique([userId, date])`）
- `app/dashboard/actions.ts`
  - `saveDailyUsage`
  - `getDashboardData`
- `app/dashboard/page.tsx`
  - ダッシュボード画面
- `app/components/dashboard-cards.tsx`
  - 上部4カード
- `app/components/daily-usage-form.tsx`
  - 入力フォーム
- `app/components/monthly-chart.tsx`
  - 月間グラフ
- `lib/calculations.ts`
  - 比較基準計算、削減率、連続達成日数、月間グラフ変換

## 認証

- `proxy.ts` で `/dashboard` を保護
- Server Actions 内で `auth()` から `userId` を取得
- DB クエリは常に `userId` でスコープ

## CI/CD (GitHub Actions)

- `/.github/workflows/ci.yml`
  - `push` / `pull_request`（`main`）で実行
  - `npm ci` -> `npm run prisma:generate` -> `npm run build`
- `/.github/workflows/deploy.yml`
  - `main` への push 時に Vercel へ本番デプロイ

CD を有効化するには GitHub リポジトリに以下の Secrets を設定してください。

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
