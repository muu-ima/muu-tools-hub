// app/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Spinner from "./components/Spinner";
import ToolCardSkeleton from "./components/ToolCardSkeleton";

type ToolLink = {
  id: string;
  name: string;
  description: string;
  href: string;
  badge?: string;
};

const tools: ToolLink[] = [
  {
    id: "profit-uk",
    name: "海外利益計算（UK版）",
    description: "GBP → JPY / 135GBPルール対応の利益計算ツール。",
    href: "/tools/profit-calc-uk",
    badge: "社内用",
  },
  {
    id: "profit-us",
    name: "海外利益計算（US版）",
    description: "USD → JPY / US向け送料・手数料対応版。",
    href: "https://enyukari.capoo.jp/profit-calc-us",
  },
  {
    id: "shipping-sim",
    name: "海外利益損益分岐点（US版）",
    description: "EMS / eパケット / FedEx などから最安発送方法を検索。",
    href: "https://enyukari.capoo.jp/shipping-manager",
  },
  {
    id: "shopify",
    name: "海外利益損益分岐点（US版）",
    description: "今後追加予定の社内ツール群。",
    href: "https://enyukari.capoo.jp",
    badge: "WIP",
  },
  {
    id: "others",
    name: "その他ツール",
    description: "今後追加予定の社内ツール群。",
    href: "https://enyukari.capoo.jp",
    badge: "WIP",
  },
];

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white/70 backdrop-blur-[2px] relative">
      {/* 🐱 トップページ専用の猫背景 */}
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

      {/* ヘッダー（為替バー付き） */}
      <SiteHeader />

      {/* メイン：スケルトン or カード */}
      <main className="flex-1 px-4 py-8 md:py-10">
        <div className="mx-auto max-w-6xl relative">
          {loading ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ToolCardSkeleton key={i} />
                ))}
              </section>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            </>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="
                  group block rounded-2xl
                  bg-white/40        /* ← ほぼ透明 */
                   backdrop-blur-[2px]
                  border border-white/30
                  shadow-[0_3px_8px_rgba(0,0,0,0.08)]
                  p-5
                  transition-all
                  hover:bg-white/40        /* ← hoverで少し白くする */
                  hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                  hover:border-white/60                "
                  target="_blank"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-base md:text-lg font-semibold group-hover:underline">
                      {tool.name}
                    </h2>
                    {tool.badge && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-50">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{tool.description}</p>
                  <p className="mt-3 text-[11px] text-slate-400">
                    クリックすると新しいタブで開きます。
                  </p>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>

      {/* フッター */}
      <SiteFooter />
    </div>
  );
}
