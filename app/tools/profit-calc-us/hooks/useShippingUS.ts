// app/tools/profit-calc-us/hooks/useShippingUS.ts

"use client";
import { useEffect, useState, useMemo } from "react";
import { getCheapestShipping, ShippingData } from "@/lib/shipping";

export type ShippingMode = "auto" | "manual";

export type ShippingResult = {
  method: string;
  price: number | null;
};

export function useShippingUS() {
  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });

  const [shippingMode, setShippingMode] = useState<ShippingMode>("auto");
  const [manualShipping, setManualShipping] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(true);

  // ---- 送料表の読み込み ----
  useEffect(() => {
    let cancelled = false;

    const fetchShipping = async () => {
      try {
        const res = await fetch("/data/shipping.json");
        const data: ShippingData = await res.json();
        if (!cancelled) {
          setShippingRates(data);
        }
      } catch (error) {
        console.error("shipping.jsonの読み込みに失敗しました", error);
        if (!cancelled) {
          setShippingRates(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchShipping();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- 自動計算結果（auto モードのときだけ）---
  const autoResult: ShippingResult | null = useMemo(() => {
    if (shippingMode !== "auto") return null;
    if (!shippingRates || weight == null || weight <= 0) return null;

    return getCheapestShipping(shippingRates, weight, dimensions);
  }, [shippingMode, shippingRates, weight, dimensions]);

  // ---- 自動／手動を統一した「現在の送料（円）」 ----
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
      ? isLoading
        ? "読み込み中..."
        : "計算中"
      : autoResult.method;

  // DutyView / Profit 計算に渡す統一結果
  const result: ShippingResult | null =
    selectedShippingJPY !== null
      ? { method: shippingMethodLabel, price: selectedShippingJPY }
      : null;

  return {
    // 入力系
    weight,
    setWeight,
    dimensions,
    setDimensions,

    // モード
    shippingMode,
    setShippingMode,
    manualShipping,
    setManualShipping,

    // 計算結果
    result,
    isLoading,
    selectedShippingJPY,
    shippingMethodLabel,
  };
}
