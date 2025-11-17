'use client';

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
    <div className="bg-blue-100 border border-blue-400 rounded-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">現在の為替レート</h2>

      <div className="flex gap-4 items-center mb-2">
        <label>
          <input
            type="radio"
            name="currency"
            value="GBP"
            checked={selectedCurrency === "GBP"}
            onChange={() => handleCurrencyChange("GBP")}
          />
          <span className="ml-1">GBP → JPY</span>
        </label>

        <label>
          <input
            type="radio"
            name="currency"
            value="USD"
            checked={selectedCurrency === "USD"}
            onChange={() => handleCurrencyChange("USD")}
          />
          <span className="ml-1">USD → JPY</span>
        </label>
      </div>

      <p>
        {selectedCurrency} → JPY（生レート）：{" "}
        {rates ? `${rates[selectedCurrency].toFixed(3)} 円` : "取得中..."}
      </p>
    </div>
  );
}
