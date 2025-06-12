import type { Metadata } from "next";
// 修正：直接从 'geist' 包导入，而不是 'next/font/google'
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

// 保留您原始的元数据
export const metadata: Metadata = {
  title: "Apex——文章",
  description: "新加坡留学、工作、生活、旅游等相关内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 修正：将字体变量应用到<html>标签，以确保全局可用
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/* 保留您自己的 'antialiased' 样式类 */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
