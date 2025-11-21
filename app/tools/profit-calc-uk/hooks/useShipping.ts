// app/tools/profit-calc-uk/hooks/useShipping.ts

"use client";

import { useEffect, useMemo, useState } from "react";
import { getCheapestShipping, type ShippingData } from "@/lib/shipping";

export type ShippingMode = "auto" | "manual";

type ShippingResult = {
  method: string;
  price: number | null;
};

export function useShipping() {
  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);

  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });

  const [shippingMode, setShippingMode] = useState<ShippingMode>("auto");
  const [manualShipping, setManualShipping] = useState<number | "">("");

  // 初期データ (送料表) 読み込み
  useEffect(() => {
    fetch("/data/shipping.json")
      .then((res) => res.json())
      .then((data) => setShippingRates(data))
      .catch((error) => {
        console.error("shipping.jsonのロードに失敗しました", error);
      });
  }, []);

  // 自動計算結果
  const autoResult = useMemo<ShippingResult | null>(() => {
    // 手動モード時 or データ不足時は null
    if (shippingMode !== "auto") return null;
    if (!shippingRates || weight == null || weight <= 0) return null;

    return getCheapestShipping(shippingRates, weight, dimensions);
  }, [shippingMode, shippingRates, weight, dimensions]);

  // 自動／手動を統一した「選択中送料」
  const selectedShippingJPY: number | null =
    shippingMode === "manual"
      ? manualShipping === ""
        ? null
        : Number(manualShipping)
      : autoResult?.price ?? null;

  const shippingMethodLabel =
    shippingMode === "manual"
      ? "手動入力"
      : autoResult === null
      ? "計算中..."
      : autoResult.method;

  return {
    // 状態
    weight,
    setWeight,
    dimensions,
    setDimensions,
    shippingMode,
    setShippingMode,
    manualShipping,
    setManualShipping,

    // 計算結果
    autoResult,
    selectedShippingJPY,
    shippingMethodLabel,
  };
}
