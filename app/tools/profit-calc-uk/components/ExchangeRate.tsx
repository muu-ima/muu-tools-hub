"use client";

import { useEffect, useState } from "react";

type ExchangeRates = {
  GBP: number;
  USD: number;
};

type Currency = "GBP" | "USD";

export default function ExchangeRate({
  onRateChange,
}: {
  onRateChange?: (rate: number | null, currency: Currency) => void;
}) {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("GBP");

  useEffect(() => {
    // 🔁 Hub 内の API に切り替え
    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((data) => {
        const gbp = data.rates?.GBP ?? null;
        const usd = data.rates?.USD ?? null;

        if (gbp && usd) {
          setRates({ GBP: gbp, USD: usd });
          // 初期値は GBP 基準で渡す
          if (onRateChange) onRateChange(gbp, "GBP");
        }
      })
      .catch((err) => {
        console.error("為替取得エラー", err);
        setRates(null);
        // ここでは selectedCurrency を使わず固定で OK（依存を増やさない）
        if (onRateChange) onRateChange(null, "GBP");
      });
  }, [onRateChange]); // ✅ selectedCurrency を参照しなくなったのでこれでOK

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    if (rates && onRateChange) {
      onRateChange(rates[currency], currency);
    }
  };

  return (
    <section className="mb-4">
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5 shadow-sm">
        {/* タイトル＋説明＋通貨切替 */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-pink-800">
              現在の為替レート
            </h2>
            <p className="text-xs text-pink-500 mt-0.5">
            使用する通貨レートをこちらで選択
            </p>
          </div>

          {/* 桜色セグメントコントロール */}
          <div className="inline-flex items-center bg-pink-100/80 rounded-full p-1 shadow-inner">
            {(["GBP", "USD"] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${
                    selectedCurrency === cur
                      ? "bg-white text-pink-600 shadow"
                      : "text-pink-500 hover:text-pink-700"
                  }
                `}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {/* レート表示 */}
        <div className="mt-1 text-sm text-pink-800">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-xs font-medium uppercase tracking-wide">
              {selectedCurrency} → JPY
            </span>
            <span className="text-[11px] text-pink-500">（生レート）</span>
          </div>

          <div className="mt-1 text-lg font-semibold">
            {rates ? (
              <>
                {rates[selectedCurrency].toFixed(3)}
                <span className="ml-1 text-sm">円</span>
              </>
            ) : (
              <span className="text-pink-400 text-sm">取得中...</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
