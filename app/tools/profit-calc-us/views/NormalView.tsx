// app/tools/profit-calc-us/views/NomalView.tsx
"use client";

import React, { useEffect, useState } from "react";
import ExchangeRate from "@/app/tools/profit-calc-us/components/ExchangeRate";
import Result from "@/app/tools/profit-calc-us/components/Result";
import { useShippingUS } from "@/app/tools/profit-calc-us/hooks/useShippingUS";
import { useCategoryFeeUS } from "@/app/tools/profit-calc-us/hooks/useCategoryFeeUS";
import { useProfitCalcUS } from "@/app/tools/profit-calc-us/hooks/useProfitCalcUS";
import { motion, AnimatePresence } from "framer-motion";
import FinalResultModal from "@/app/tools/profit-calc-us/components/FinalResultModal";

import { useTimeout } from "@/app/tools/profit-calc-uk/hooks/useTimeout";

export default function NomalView() {
  // ====== State ======
  const [rate, setRate] = useState<number | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  // ====== タイマー（ローディング演出用） ======
  const timeoutReached = useTimeout(5000);

  // ====== 配送（hook） ======
  const {
    weight,
    setWeight,
    dimensions,
    setDimensions,
    shippingMode,
    setShippingMode,
    manualShipping,
    setManualShipping,
    result: shippingResult,
    selectedShippingJPY,
    shippingMethodLabel,
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
    result: shippingResult,
    selectedCategoryFee,
  });

  // 売値 + 州税（Result 用表示）
  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;

  // ====== ローディング判定 ======
  const coreReady = rate !== null && categoryOptions.length > 0;
  const isLoadingAll = !coreReady && !timeoutReached;

  // ====== UI ======
  return (
    <div
      className={`
        py-4 transition-all duration-300
        ${isLoadingAll ? "blur-sm opacity-60" : "opacity-100 blur-0"}
      `}
    >
      <div className="mb-5">
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
          </div>

          {/* 配送料モード */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-800 leading-none md:pb-5 pb-3">
                配送料モード
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={shippingMode === "manual"}
                onClick={() =>
                  setShippingMode((m) => (m === "auto" ? "manual" : "auto"))
                }
                className="relative inline-flex items-center h-9 w-36 rounded-full bg-neutral-200 transition"
              >
                <span
                  className={`w-1/2 text-center text-sm ${
                    shippingMode === "auto"
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-500"
                  }`}
                >
                  自動
                </span>
                <span
                  className={`w-1/2 text-center text-sm ${
                    shippingMode === "manual"
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-500"
                  }`}
                >
                  手動
                </span>

                <motion.span
                  layout
                  className="absolute h-7 w-7 rounded-full bg-white shadow"
                  style={{ top: 4, left: 4 }}
                  animate={{ x: shippingMode === "manual" ? 96 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              </button>
            </div>

            {/* 自動・手動切り替えフォーム */}
            <motion.div
              layout
              className="mt-1 rounded-lg"
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              {isLoadingAll ? (
                <div className="h-36 w-full rounded-lg bg-neutral-200 animate-pulse" />
              ) : (
                shippingMode && (
                  <AnimatePresence mode="wait" initial={false}>
                    {shippingMode === "auto" ? (
                      <motion.fieldset
                        key="auto"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-neutral-800 mb-1">
                            実重量 (g)
                          </label>
                          <input
                            type="number"
                            value={weight ?? ""}
                            onChange={(e) =>
                              setWeight(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-800 mb-1">
                            サイズ (cm)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              value={dimensions.length || ""}
                              onChange={(e) =>
                                setDimensions((prev) => ({
                                  ...prev,
                                  length: Number(e.target.value) || 0,
                                }))
                              }
                              placeholder="長さ"
                              className="px-2 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                            />
                            <input
                              type="number"
                              value={dimensions.width || ""}
                              onChange={(e) =>
                                setDimensions((prev) => ({
                                  ...prev,
                                  width: Number(e.target.value) || 0,
                                }))
                              }
                              placeholder="幅"
                              className="px-2 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                            />
                            <input
                              type="number"
                              value={dimensions.height || ""}
                              onChange={(e) =>
                                setDimensions((prev) => ({
                                  ...prev,
                                  height: Number(e.target.value) || 0,
                                }))
                              }
                              placeholder="高さ"
                              className="px-2 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                            />
                          </div>
                        </div>
                      </motion.fieldset>
                    ) : (
                      <motion.div
                        key="manual"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <label className="block text-sm font-semibold text-neutral-800 mb-1">
                          配送料（円・手動）
                        </label>
                        <input
                          type="number"
                          value={manualShipping}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") return setManualShipping("");
                            const num = Math.max(0, Number(raw));
                            setManualShipping(num);
                          }}
                          className="w-full px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          ※ 手動入力時は重量/サイズは非表示になります
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )
              )}
            </motion.div>
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
          <div className="p-4 border border-neutral-300 rounded-lg bg-white shadow-sm">
            <p className="text-sm">配送方法: {shippingMethodLabel}</p>
            <p className="text-sm">
              配送料:{" "}
              {selectedShippingJPY !== null
                ? `${selectedShippingJPY}円`
                : "未計算"}
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
            <FinalResultModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              shippingMethod={shippingResult?.method || ""}
              shippingJPY={selectedShippingJPY ?? 0}
              data={final}
              exchangeRateUSDtoJPY={rate ?? 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
