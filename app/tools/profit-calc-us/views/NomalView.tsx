// app/tools/profit-calc-us/views/NomalView.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getCheapestShipping, ShippingData } from "@/lib/shipping";
import ExchangeRate from "@/app/tools/profit-calc-us/components/ExchangeRate";
import Result from "@/app/tools/profit-calc-us/components/Result";
import {
  calculateFinalProfitDetailUS,
  calculateCategoryFeeUS,
  calculateActualCost,
  calculateGrossProfit,
  calculateProfitMargin,
} from "@/lib/profitCalcUS";
import FinalResult from "@/app/tools/profit-calc-us/components/FinalResultModal";
// 型定義
type ShippingResult = {
  method: string;
  price: number | null;
};

type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

type CalcResult = {
  shippingJPY: number;
  categoryFeeJPY: number;
  actualCost: number;
  grossProfit: number;
  profitMargin: number;
  method: string;
  rate: number;
  sellingPriceJPY: number;
};

export default function NomalView() {
  // ====== State ======
  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [rate, setRate] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryFeeType[]>([]);
  const [selectedCategoryFee, setSelectedCategoryFee] = useState<number | "">(
    ""
  );
  const [isOpen, setIsOpen] = useState(false);

  // ====== 外部データ取得 ======

  // 配送料テーブル
  useEffect(() => {
    fetch("/data/shipping.json")
      .then((res) => res.json())
      .then((data) => setShippingRates(data));
  }, []);

  // カテゴリ手数料テーブル
  useEffect(() => {
    fetch("/data/categoryFees.json")
      .then((res) => res.json())
      .then((data) => setCategoryOptions(data));
  }, []);

  // 為替のログ（デバッグ用）
  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  // ====== 配送結果（useMemo） ======
  const result: ShippingResult | null = useMemo(() => {
    if (!shippingRates || weight == null || weight <= 0) return null;
    return getCheapestShipping(shippingRates, weight, dimensions);
  }, [shippingRates, weight, dimensions]);

  // ====== 利益計算（useMemo） ======
  const calcResult: CalcResult | null = useMemo(() => {
    if (
      sellingPrice === "" ||
      costPrice === "" ||
      rate === null ||
      weight === null ||
      result === null ||
      result.price === null ||
      selectedCategoryFee === ""
    ) {
      return null;
    }

    const sellingPriceUSD = parseFloat(sellingPrice);
    if (Number.isNaN(sellingPriceUSD)) return null;

    const rateSafe = rate ?? 0;
    const shippingJPY = result.price ?? 0;

    // 売値（円換算）
    const sellingPriceJPY = sellingPriceUSD * rateSafe;

    // カテゴリ手数料率(%)
    const categoryFeePercent =
      typeof selectedCategoryFee === "number"
        ? selectedCategoryFee
        : Number(selectedCategoryFee);

    // カテゴリ手数料(JPY)
    const categoryFeeJPY = calculateCategoryFeeUS(
      sellingPriceJPY,
      categoryFeePercent
    );

    // 仕入れ(JPY)
    const costJPY =
      typeof costPrice === "number" ? costPrice : Number(costPrice);

    // 実費合計
    const actualCost = calculateActualCost(
      costJPY,
      shippingJPY,
      categoryFeeJPY
    );

    // 粗利 / 利益率（売値JPYベース）
    const grossProfit = calculateGrossProfit(sellingPriceJPY, actualCost);
    const profitMargin = calculateProfitMargin(grossProfit, sellingPriceJPY);

    return {
      shippingJPY,
      categoryFeeJPY,
      actualCost,
      grossProfit,
      profitMargin,
      method: result.method,
      rate: rateSafe,
      sellingPriceJPY,
    };
  }, [sellingPrice, costPrice, rate, weight, result, selectedCategoryFee]);

  // ====== Final 計算（Modal用） ======
  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;

  const final = calcResult
    ? calculateFinalProfitDetailUS({
        sellingPrice: sellingPriceNum,
        costPrice: typeof costPrice === "number" ? costPrice : 0,
        shippingJPY: calcResult.shippingJPY,
        categoryFeePercent: (selectedCategoryFee || 0) as number,
        paymentFeePercent: 1.35, // 決済手数料(%)
        exchangeRateUSDtoJPY: rate ?? 0,
        targetMargin: 0.3,
      })
    : null;

  // ====== ボタン活性 ======
  const isEnabled =
    !Number.isNaN(sellingPriceNum) &&
    sellingPrice !== "" &&
    costPrice !== "" &&
    rate !== null &&
    weight !== null &&
    selectedCategoryFee !== "";

  // ====== UI ======
  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ProfitCalc (US)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          仕入れ値・配送料・為替レートから利益率や詳細な数値を自動計算します
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        {/* 左カラム */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* 為替レート */}
          <ExchangeRate onRateChange={setRate} />

          {/* 仕入れ値 */}
          <div>
            <label className="block font-semibold mb-1">仕入れ値 (円)</label>
            <input
              type="number"
              step="10"
              min="10"
              value={costPrice}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setCostPrice("");
                  return;
                }
                let num = Number(raw);
                if (num < 0) num = 0;
                setCostPrice(num);
              }}
              placeholder="仕入れ値"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* 売値 */}
          <div>
            <label className="block font-semibold mb-1">売値 ($)</label>
            <input
              type="text"
              value={sellingPrice}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSellingPrice("");
                  return;
                }
                // 数字 + 小数点2桁まで
                if (/^\d*\.?\d{0,2}$/.test(raw)) {
                  setSellingPrice(raw);
                }
              }}
              onBlur={() => {
                if (sellingPrice !== "") {
                  const num = Math.floor(parseFloat(sellingPrice) * 100) / 100;
                  setSellingPrice(num.toFixed(2));
                }
              }}
              placeholder="売値"
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="mt-1 h-5 text-xs text-gray-500">
              {rate !== null && sellingPrice !== "" && (
                <p>
                  概算円価格：約 {Math.round(parseFloat(sellingPrice) * rate)}{" "}
                  円
                </p>
              )}
            </div>
          </div>

          {/* 実重量 */}
          <div>
            <label className="block font-semibold mb-1">実重量 (g)</label>
            <input
              type="number"
              value={weight ?? ""}
              onChange={(e) =>
                setWeight(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="実重量"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* サイズ */}
          <div>
            <label className="block font-semibold mb-1">サイズ (cm)</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={dimensions.length || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = raw === "" ? 0 : Math.max(0, Number(raw));
                  setDimensions((prev) => ({ ...prev, length: num }));
                }}
                placeholder="長さ"
                className="px-2 py-1 border rounded-md"
              />
              <input
                type="number"
                value={dimensions.width || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = raw === "" ? 0 : Math.max(0, Number(raw));
                  setDimensions((prev) => ({ ...prev, width: num }));
                }}
                placeholder="幅"
                className="px-2 py-1 border rounded-md"
              />
              <input
                type="number"
                value={dimensions.height || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = raw === "" ? 0 : Math.max(0, Number(raw));
                  setDimensions((prev) => ({ ...prev, height: num }));
                }}
                placeholder="高さ"
                className="px-2 py-1 border rounded-md"
              />
            </div>
          </div>

          {/* カテゴリ手数料 */}
          <div>
            <label className="block font-semibold mb-1">カテゴリ手数料</label>
            <select
              value={selectedCategoryFee}
              onChange={(e) => setSelectedCategoryFee(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">カテゴリを選択してください</option>
              {categoryOptions.map((cat) => (
                <option key={cat.label} value={cat.value}>
                  {cat.label} ({cat.value}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右カラム */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* 配送結果 */}
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <p>配送方法: {result === null ? "計算中..." : result.method}</p>
            <p>
              配送料:{" "}
              {result === null
                ? "計算中..."
                : result.price !== null
                ? `${result.price}円`
                : "不明"}
            </p>
          </div>

          {/* 利益結果 */}
          {rate !== null && sellingPrice !== "" && (
            <Result
              originalPriceUSD={
                sellingPrice !== "" ? parseFloat(sellingPrice) : 0
              }
              priceJPY={calcResult?.sellingPriceJPY ?? 0}
              sellingPriceInclTax={sellingPriceInclTax}
              exchangeRateUSDtoJPY={rate ?? 0}
              calcResult={calcResult}
            />
          )}

          {/* モーダルボタン */}
          <button
            onClick={() => setIsOpen(true)}
            disabled={!isEnabled}
            className={`btn-primary ${
              isEnabled
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            } px-8 py-4 text-lg rounded-full transition-colors duration-300`}
          >
            最終利益の詳細を見る
          </button>

          {/* モーダル */}
          {final && (
            <FinalResult
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              shippingMethod={result?.method || ""}
              shippingJPY={calcResult?.shippingJPY || 0}
              data={final}
              exchangeRateUSDtoJPY={rate ?? 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
