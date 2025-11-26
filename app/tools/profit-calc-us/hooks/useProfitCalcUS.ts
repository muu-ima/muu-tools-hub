"use client";

import { useMemo } from "react";
import {
  calculateCategoryFeeUS,
  calculateActualCost,
  calculateGrossProfit,
  calculateProfitMargin,
  calculateFinalProfitDetailUS,
} from "@/lib/profitCalcUS";

import type { ShippingResult } from "./useShippingUS";

export function useProfitCalcUS({
  sellingPrice,
  costPrice,
  rate,
  result,
  selectedCategoryFee,
}: {
  sellingPrice: string;
  costPrice: number | "";
  rate: number | null;
  result: ShippingResult | null;
  selectedCategoryFee: number | "";
}) {
  // =============================
  // ✨ 基本計算（常に最新）
  // =============================
  const calcResult = useMemo(() => {
    if (
      sellingPrice === "" ||
      costPrice === "" ||
      rate === null ||
      !result ||
      result.price === null ||
      selectedCategoryFee === ""
    ) {
      return null;
    }

    const sellingPriceUSD = parseFloat(sellingPrice);
    if (Number.isNaN(sellingPriceUSD)) return null;

    const sellingPriceJPY = sellingPriceUSD * rate;
    const shippingJPY = result.price;

    const categoryFeeJPY = calculateCategoryFeeUS(
      sellingPriceJPY,
      selectedCategoryFee as number
    );

    const costJPY =
      typeof costPrice === "number" ? costPrice : Number(costPrice);

    const actualCost = calculateActualCost(costJPY, shippingJPY, categoryFeeJPY);
    const grossProfit = calculateGrossProfit(sellingPriceJPY, actualCost);
    const profitMargin = calculateProfitMargin(grossProfit, sellingPriceJPY);

    return {
      sellingPriceJPY,
      shippingJPY,
      categoryFeeJPY,
      actualCost,
      grossProfit,
      profitMargin,
      method: result.method,
      rate,
    };
  }, [sellingPrice, costPrice, rate, result, selectedCategoryFee]);

  // =============================
  // ✨ 最終利益計算（Modal用）
  // =============================
  const final = useMemo(() => {
    if (!calcResult) return null;

    const sellingPriceNum = parseFloat(sellingPrice);

    return calculateFinalProfitDetailUS({
      sellingPrice: sellingPriceNum,
      costPrice:
        typeof costPrice === "number" ? costPrice : Number(costPrice),
      shippingJPY: calcResult.shippingJPY,
      categoryFeePercent: selectedCategoryFee as number,
      paymentFeePercent: 1.35,
      exchangeRateUSDtoJPY: rate ?? 0,
      targetMargin: 0.3,
    });
  }, [calcResult, sellingPrice, costPrice, rate, selectedCategoryFee]);

  // =============================
  // ✨ ボタン活性/非活性
  // =============================
  const isEnabled =
    sellingPrice !== "" &&
    costPrice !== "" &&
    rate !== null &&
    result?.price !== null &&
    selectedCategoryFee !== "";

  return {
    calcResult,
    final,
    isEnabled,
  };
}
