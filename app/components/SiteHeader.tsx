// app/components/SiteHeader.tsx
import Link from "next/link";
import ExchangeRateBar from "./ExchangeRateBar";

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-pink-500 via-rose-500 to-red-400 bg-clip-text text-transparent">
                Cocco Neil.<span className="ml-1">Tool-hub</span>
              </h1>
            </Link>
            <p className="mt-1 text-xs md:text-sm text-slate-600">
              社内向けの利益計算・発送管理・予約システムなどをまとめたツールハブです。
            </p>
          </div>

          {/* 必要なら右側にナビスペース */}
          <nav className="flex items-center gap-3 text-xs md:text-sm text-slate-500">
            {/* いまはダミー。将来「予約管理」「発送ツール」など増やしてOK */}
            <span>Internal Use Only</span>
          </nav>
        </div>

        {/* 為替バー */}
        <div className="mt-3">
          <ExchangeRateBar />
        </div>
      </div>
    </header>
  );
}
