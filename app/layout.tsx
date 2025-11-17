// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { Zen_Maru_Gothic } from "next/font/google";

const zen = Zen_Maru_Gothic({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocco Neil. Tool-hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`
          ${zen.className}
          min-h-screen
          bg-[#fdfdfd]
          text-slate-900
        `}
      >
        {/* 👇 背景専用レイヤー（サイズ＆位置を固定） */}
        <div
          className="
            pointer-events-none
            fixed inset-0 -z-10
            bg-[url('/cocco-bg-2.png')]
            bg-no-repeat
            bg-size-[1200px_auto]         
            bg-position-[left_100px_top_140px]
          "
        />

        <div className="min-h-screen flex flex-col bg-white/70 backdrop-blur-[2px]">
          <SiteHeader />
          <main className="flex-1 px-4 py-6 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
