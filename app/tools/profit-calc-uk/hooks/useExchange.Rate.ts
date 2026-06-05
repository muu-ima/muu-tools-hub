// app/tools/profit-calc-uk/hooks/useExchangeRate.ts

"use client";

import { useCallback, useState } from "react";

export type Currency = "GBP" | "USD";

export function useExchangeRate() {
    const [rate, setRate] = useState<number | null>(null); // 「今選択中の通貨->JPY」
    const [currency, setCurrency] = useState<Currency>("GBP");
    const [gbpRate, setGbpRate] = useState<number | null>(null);
    const [usdRate, setUsdRate] = useState<number | null>(null);

    const handleRateChange = useCallback(
        (newRate: number | null, newCurrency: Currency) => {
            // UI用
            setRate(newRate);
            setCurrency(newCurrency);

            // 両方のレートをここで記憶しておく
            if (newCurrency === "GBP") {
                setGbpRate(newRate);
            } else {
                setUsdRate(newRate);
            }
        },
        []
    );

    return {
        rate,
        currency,
        gbpRate,
        usdRate,
        handleRateChange,
    };
}
