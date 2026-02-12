import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Noto_Sans_JP } from "next/font/google";

import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "スクリーンタイム削減管理",
  description: "日々のスマホ利用時間を記録して、削減進捗を可視化するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${notoSansJp.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
