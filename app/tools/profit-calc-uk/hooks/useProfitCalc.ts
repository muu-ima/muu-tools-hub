// app/tools/profit-calc-uk/hooks/useProfitCalc.ts

"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateFinalProfitDetail } from "@/lib/profitCalc";
import type { Currency } from "./useExchange.Rate";

type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

type useProfitCalcArgs = {
  sellingPrice: number | "";
  costPrice: number | "";
  rate: number | null;
  currency: Currency;
  gbpRate: number | null;
  usdRate: number | null;
  selectedShippingJPY: number | null;
};

export function useProfitCalc({
  sellingPrice,
  costPrice,
  rate,
  currency,
  gbpRate,
  usdRate,
  selectedShippingJPY,
}: useProfitCalcArgs) {
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<CategoryFeeType[]>([]);
  const [selectedCategoryFee, setSelectedCategoryFee] = useState<number | "">(
    ""
  );

  // カテゴリ手数料マスタ読込
  useEffect(() => {

    fetch("/data/categoryFees.json")
      .then((res) => res.json())
      .then((data) => { 
          setCategoryOptions(data);
  })
      .catch((error) => {
        console.error("categoryFee.json のロードに失敗しました。", error);
      })
      .finally(() =>{
        setLoadingCategories(false);
      });
  }, []);

  // 売値 (number だけ抽出)
  const originalPriceNumber =
    typeof sellingPrice === "number" ? sellingPrice : 0;

  // 現在通貨での売値 ->　円換算
  const approxJPY =
    rate && originalPriceNumber ? originalPriceNumber * rate : 0;

  // GBP ベースの売値 (VAT 判定・最終計算用)
  const sellingPriceGBPForCalc = useMemo(() => {
    if (typeof sellingPrice !== "number") return 0;

    // GBPモードのときはそのまま
    if (currency === "GBP") return sellingPrice;

    // USDモードのときは USD->GBP　に変換
    if (!usdRate || !gbpRate) return 0;
    const usdToGbp = usdRate / gbpRate; // 1USD が何ポンドか
    return sellingPrice * usdToGbp;
  }, [sellingPrice, currency, usdRate, gbpRate]);

  // 135ポンド超過フラグ (VATルール判断用)
  const overThreshold = sellingPriceGBPForCalc > 135;

  // 最終利益計算 (GBPベース)
  const final = useMemo(() =>{
    if (
        sellingPriceGBPForCalc <=0 ||
        typeof costPrice !== "number" ||
        gbpRate === null ||
        selectedShippingJPY === null ||
        selectedCategoryFee === ""
    ) {
        return null;
    }

    return calculateFinalProfitDetail({
        sellingPriceGBP: sellingPriceGBPForCalc, // GBPに統一
        costPriceJPY: costPrice,
        shippingJPY: selectedShippingJPY,
        categoryFeePercent: selectedCategoryFee as number,
        customsRatePercent: 1.35,
        payoneerFeePercent: 2,
        includeVAT: true,
        exchangeRateGBPtoJPY: gbpRate,
    });    
  }, [
    sellingPriceGBPForCalc,
    costPrice,
    gbpRate,
    selectedShippingJPY,
    selectedCategoryFee,
  ]);

  // ボタンの活性状態
  const isEnabled = 
  sellingPrice !== "" &&
  costPrice !== "" &&
  rate !== null &&
  selectedCategoryFee !== "" &&
  selectedShippingJPY !== null;

  return {
    categoryOptions,
    selectedCategoryFee,
    setSelectedCategoryFee,
    originalPriceNumber,
    approxJPY,
    overThreshold,
    final,
    isEnabled,
    loadingCategories,  
  };
}
