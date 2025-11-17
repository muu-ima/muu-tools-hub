// src/app/components/ExchangeRateBar.tsx
"use client";

import { useEffect, useState } from "react";

type Rates = {
  GBP: number;
  USD: number;
};

export default function ExchangeRateBar() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/exchange-rate", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        const data = await res.json();
        if (data?.rates?.GBP && data?.rates?.USD) {
          setRates({
            GBP: data.rates.GBP,
            USD: data.rates.USD,
          });
        }
        if (data?.timestamp) {
          setUpdatedAt(data.timestamp);
        }
      } catch (e) {
        console.error("為替APIエラー", e);
        setError("為替レートの取得に失敗しました");
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
          ¥
        </span>
        <span className="text-sm font-medium text-sky-900">
          現在の為替レート（参考値）
        </span>
      </div>

      <div className="mt-1 md:mt-0 text-xs md:text-sm text-sky-900 flex flex-wrap items-center gap-x-4 gap-y-1">
        {error && <span className="text-red-600">{error}</span>}

        {rates ? (
          <>
            <span>1 GBP ≒ {rates.GBP.toFixed(3)} 円</span>
            <span>1 USD ≒ {rates.USD.toFixed(3)} 円</span>
          </>
        ) : !error ? (
          <span>取得中…</span>
        ) : null}

        {updatedAt && (
          <span className="text-[10px] md:text-[11px] text-sky-700/80">
            更新: {new Date(updatedAt).toLocaleString("ja-JP")}
          </span>
        )}
      </div>
    </div>
  );
}
