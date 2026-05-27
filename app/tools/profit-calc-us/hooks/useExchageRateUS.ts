// app/tools/profit-calc-us/hooks/useExchangeRateUS.ts
"use client";

import { useEffect, useState } from "react";

type ExchangeRateResponse = {
  rates?: {
    USD?: number;
  };
  errors?: string[];
};

export function useExchangeRateUS(onRateChange?: (rate: number | null) => void) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/exchange-rate", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        return res.json();
      })
      .then((data: ExchangeRateResponse) => {
        if (cancelled) return;

        const usd = data.rates?.USD ?? null;
        if (usd === null && data.errors?.length) {
          console.error("為替APIエラー", data.errors);
        }
        setRate(usd);
        setLoading(false);
        onRateChange?.(usd);
      })
      .catch(() => {
        if (cancelled) return;

        setRate(null);
        setLoading(false);
        onRateChange?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [onRateChange]);

  return { rate, loading };
}
