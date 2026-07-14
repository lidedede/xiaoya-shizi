import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小芽识字｜宝宝的汉字乐园",
  description: "专为学龄前儿童设计的趣味汉字启蒙工具。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
