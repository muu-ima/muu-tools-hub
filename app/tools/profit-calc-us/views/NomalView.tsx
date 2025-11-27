// app/tools/profit-calc-us/views/NomalView.tsx
"use client";

import React, { useEffect, useState } from "react";
import ExchangeRate from "@/app/tools/profit-calc-us/components/ExchangeRate";
import Result from "@/app/tools/profit-calc-us/components/Result";
import { useShippingUS } from "@/app/tools/profit-calc-us/hooks/useShippingUS";
import { useCategoryFeeUS } from "@/app/tools/profit-calc-us/hooks/useCategoryFeeUS";
import { useProfitCalcUS } from "@/app/tools/profit-calc-us/hooks/useProfitCalcUS";

import FinalResultModal from "@/app/tools/profit-calc-us/components/FinalResultModal";

export default function NomalView() {
  // ====== State ======
  const [rate, setRate] = useState<number | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  // ====== 配送（hook） ======
  const {
    weight,
    setWeight,
    dimensions,
    setDimensions,
    result,
    isLoading: isShippingLoading,
  } = useShippingUS();

  // ====== カテゴリ手数料（hook） ======
  const { categoryOptions, selectedCategoryFee, setSelectedCategoryFee } =
    useCategoryFeeUS();

  // 為替のログ（デバッグ用）
  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  // ====== 利益計算（hook） ======
  const { calcResult, final, isEnabled } = useProfitCalcUS({
    sellingPrice,
    costPrice,
    rate,
    result,
    selectedCategoryFee,
  });

  // 売値 + 州税（Result 用表示）
  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;

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
              placeholder="5000"
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
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
              placeholder="150"
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
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
              placeholder="3000"
              className="w-full px-3 py-2  bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1  bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1  bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1  bg-white border-neutral-300 rounded-md"
              />
            </div>
          </div>

          {/* カテゴリ手数料 */}
          <div>
            <label className="block font-semibold mb-1">カテゴリ手数料</label>
            <select
              value={selectedCategoryFee}
              onChange={(e) => setSelectedCategoryFee(Number(e.target.value))}
              className="w-full px-3 py-2  bg-white border-neutral-300 rounded-md"
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
          <div className="w-full px-4 py-4 bg-white border border-neutral-300 rounded-lg shadow-sm">
            {isShippingLoading ? (
              <>
                <p className="text-sm text-neutral-700">配送方法: 計算中...</p>
                <p className="text-sm text-neutral-700">配送料: 計算中...</p>
              </>
            ) : result === null ? (
              <>
                <p className="text-sm text-neutral-700">配送方法: 未計算</p>
                <p className="text-sm text-neutral-700">配送料: 未計算</p>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-700">
                  配送方法: {result.method}
                </p>
                <p className="text-sm text-neutral-700">
                  配送料: {result.price}円
                </p>
              </>
            )}
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
            <FinalResultModal
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
