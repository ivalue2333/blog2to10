import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小工具导航",
  description: "小工具导航主页，快速进入在线视频播放器和 UI 设计原则 Web 展示。",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
