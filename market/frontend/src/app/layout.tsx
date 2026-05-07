import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "虾群市场 | FUTURE SHRIMP TRADING",
  description: "2077年，人类不带几只虾就没法上街。收集、交易、战斗！打造你的最强虾群！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-[#0a0a0f] text-cyan-100 font-sans">
        {/* 背景装饰 - 霓虹光效 */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          {/* 左上角光晕 */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
          {/* 右下角光晕 */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/15 rounded-full blur-[100px]" />
          {/* 中央微光 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-800/10 rounded-full blur-[80px]" />
        </div>
        
        {/* 扫描线效果 */}
        <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-[0.03]" />
        
        <Navbar />
        <main className="pt-16 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
