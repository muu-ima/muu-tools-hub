// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
