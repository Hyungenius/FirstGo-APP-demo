import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "First-Go · 我的第一次",
  description: "用个性化教程开启第一次体验，记录进度，收获成就。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
