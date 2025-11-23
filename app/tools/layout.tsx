// app/tools/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOOL_MENU = [
  { href: "/tools/profit-calc-uk", label: "海外利益計算（UK版）" },
  { href: "/tools/profit-calc-us", label: "海外利益計算（US版）" },
  { href: "/tools/shipping-us", label: "海外送料損益分岐点（US版）" },
  { href: "/tools/others", label: "その他ツール" },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === "/tools";

  return (
    <div
      className="
        relative
        min-h-screen flex flex-col 
        bg-(--background) text-(--foreground)
        bg-[url('/cocco-bg-4.png')]
        bg-cover bg-center bg-no-repeat
      "
    >
      {" "}
      {/* ▼ 共通ヘッダー */}
      <header
        className="
    sticky top-0 z-40 
    border-b border-neutral-200
    bg-white/20 backdrop-blur
  "
      >
        {" "}
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* 左側：ロゴ / タイトル */}
          <div className="flex flex-col">
            <Link href="https://enyukari.capoo.jp/cocco-tools-hub/" className="font-bold text-xl text-pink-600">
              Cocco Neil. Tool-hub
            </Link>
            {!isRoot && (
              <span className="text-xs text-neutral-500">
                社内向けツールメニュー
              </span>
            )}
          </div>

          {/* 右側：下位ページのときだけメニューを表示 */}
          {!isRoot && (
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {TOOL_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-blue-600 ${
                    pathname === item.href
                      ? "text-blue-600 font-semibold"
                      : "text-neutral-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      {/* ▼ 各ページ本体 */}
      <main className="flex-1 px-4 py-2 md:py-4">
        <div className="mx-auto max-w-screen-2xl">{children}</div>
      </main>
      {/* ▼ 右下の猫デコレーション */}
      <div
        className="
          pointer-events-none
          absolute right-8 bottom-30
          hidden xl:block
        "
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cocco-bg-cat.png"   // ← 保存したファイル名に合わせて
          alt=""
          className="max-w-[700px] drop-shadow-lg"
        />
      </div>
      {/* ▼ 共通フッター（必要なら） */}
      <footer className="py-6 text-center text-xs text-neutral-400">
        © 2025 Cocco Neil. All rights reserved.
      </footer>
    </div>
  );
}
