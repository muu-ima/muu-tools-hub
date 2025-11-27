// app/tools/profit-calc-us/hooks/useExchangeRateUS.ts

"use client";
import { useEffect, useState } from "react";

export function useExchangeRateUS() {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then(res => res.json())
      .then(data => {
        const usd = data.rates?.USD ?? null;
        setRate(usd);
      })
      .catch(() => setRate(null));
  }, []);

  return { rate };
}
