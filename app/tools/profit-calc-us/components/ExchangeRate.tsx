"use client";
import { useEffect, useState } from "react";

type ExchangeRateResponse = {
  rates?: {
    USD?: number;
    GBP?: number;
  };
};

export default function ExchangeRate({
  onRateChange,
}: {
  onRateChange?: (rate: number | null) => void;
}) {
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((data: ExchangeRateResponse) => {
        if (cancelled) return;
        const rate = data.rates?.USD ?? null;

        setUsdRate(rate);
        setLoading(false);

        if (onRateChange) onRateChange(rate);
      })
      .catch((err) => {
        console.error("為替取得エラー", err);
        if (cancelled) return;
        setUsdRate(null);
        setLoading(false);
        if (onRateChange) onRateChange(null);
      });

    return () => {
      cancelled = true;
    };
  }, [onRateChange]);

  return (
    <section className="mb-4">
      <div
        className="
                bg-white/60
                border border-white/40
                backdrop-blur-4px
                rounded-2xl
                p-5 shadow-sm
            "
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-blue-800">
              現在の為替レート（US）
            </h2>
            <p className="text-xs text-blue-500 mt-0.5">
              このツールでは USD → JPY のレートを使用します
            </p>
          </div>
        </div>

        <div className="mt-1 text-sm text-blue-800">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-xs font-medium uppercase tracking-wide">
              USD → JPY
            </span>
            <span className="text-[11px] text-blue-500">（生レート）</span>
          </div>

          <div className="mt-1 text-lg font-semibold">
            {loading ? (
              <span className="text-blue-400 text-sm">取得中...</span>
            ) : usdRate !== null ? (
              <>
                {usdRate.toFixed(3)}
                <span className="ml-1 text-sm">円</span>
              </>
            ) : (
              <span className="text-red-400 text-sm">取得に失敗しました</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
