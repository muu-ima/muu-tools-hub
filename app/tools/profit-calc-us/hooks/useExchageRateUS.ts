// app/tools/profit-calc-us/hooks/useExchangeRateUS.ts
"use client";

import { useEffect, useState } from "react";

type ExchangeRateResponse = {
  rates?: {
    USD?: number;
  };
};

export function useExchangeRateUS(onRateChange?: (rate: number | null) => void) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((data: ExchangeRateResponse) => {
        if (cancelled) return;

        const usd = data.rates?.USD ?? null;
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
