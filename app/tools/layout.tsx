// app/tools/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const TOOL_MENU = [
  { href: "/tools/profit-calc-uk", label: "海外利益計算（UK版）" },
  { href: "/tools/profit-calc-us", label: "海外利益計算（US版）" },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoot = pathname === "/tools";
  const isUS = pathname.startsWith("/tools/profit-calc-us");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
    className={`
      relative min-h-screen flex flex-col 
      bg-(--background) text-(--foreground)
      ${isUS 
        ? "bg-[url('/cocco-bg-10.png')]"  // ← US専用背景
        : "bg-[url('/cocco-bg-4.png')]" // ← UK & その他
      }
      bg-cover bg-center bg-no-repeat
    `}
  >
      {/* ▼ 共通ヘッダー */}
      <header
        className="
          sticky top-0 z-40 
          border-b border-neutral-200
          bg-white/20 backdrop-blur
        "
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* 左側：ロゴ / タイトル */}
          <div className="flex flex-col">
            <Link
              href="https://enyukari.capoo.jp/cocco-tools-hub/"
              className="font-bold text-xl text-pink-600"
            >
              Cocco Neil. Tool-hub
            </Link>
            {!isRoot && (
              <span className="text-xs text-neutral-500">
                社内向けツールメニュー
              </span>
            )}
          </div>

          {/* 右側：メニュー */}
          {!isRoot && (
            <>
              {/* 🔵 デスクトップ（1024px以上）は横並びメニュー */}
              <nav className="hidden lg:flex items-center gap-5 text-sm">
                {TOOL_MENU.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        relative pb-0.5
                        hover:text-blue-600
                        ${
                          active
                            ? "text-blue-600 font-semibold"
                            : "text-neutral-600"
                        }
                      `}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-blue-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* 🟣 モバイル / タブレット（1024px未満）はハンバーガー */}
              <button
                type="button"
                className="
                  lg:hidden
                  inline-flex items-center justify-center
                  w-10 h-10 rounded-full
                  border border-neutral-300
                  bg-white/80
                  text-neutral-700
                  shadow-sm
                "
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="ツールメニューを開く"
              >
                {/* 簡易ハンバーガーアイコン */}
                <div className="space-y-1.5">
                  <span className="block w-5 h-0.5 bg-neutral-700 rounded" />
                  <span className="block w-5 h-0.5 bg-neutral-700 rounded" />
                </div>
              </button>
            </>
          )}
        </div>

        {/* ▼ モバイル用メニュー（ハンバーガー展開部分） */}
        {!isRoot && mobileOpen && (
          <nav className="lg:hidden border-t border-neutral-200 bg-white/90 backdrop-blur px-4 py-3">
            <div className="flex flex-col gap-2 text-sm">
              {TOOL_MENU.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      w-full px-3 py-2 rounded-lg border text-left
                      ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-neutral-800 border-neutral-300"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
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
          src="/cocco-bg-cat.png"
          alt=""
          className="max-w-[700px] drop-shadow-lg"
        />
      </div>

      {/* ▼ 共通フッター */}
      <footer className="py-6 text-center text-xs text-neutral-400">
        © 2025 Cocco Neil. All rights reserved.
      </footer>
    </div>
  );
}
