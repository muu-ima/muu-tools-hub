// app/tools/profit-calc-uk/views/ReverseView.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useTimeout } from "@/app/tools/profit-calc-uk/hooks/useTimeout";
import ExchangeRate from "@/app/tools/profit-calc-uk/components/ExchangeRate";
import Result from "@/app/tools/profit-calc-uk/components/Result";
import FinalResultModal from "@/app/tools/profit-calc-uk/components/FinalResultModal";

import { useExchangeRate } from "@/app/tools/profit-calc-uk/hooks/useExchange.Rate";
import { useShipping } from "@/app/tools/profit-calc-uk/hooks/useShipping";
import { useProfitCalc } from "@/app/tools/profit-calc-uk/hooks/useProfitCalc";
import { calculateSellingPriceFromProfitRateUK } from "@/lib/profitCalc";

export default function ReverseView() {
  const timeoutReached = useTimeout(5000);

  // ====== 為替 ======
  const { rate, currency, gbpRate, usdRate, handleRateChange } =
    useExchangeRate();

  // ====== 入力 ======
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");

  // 目標利益率(%)
  const [targetProfitRate, setTargetProfitRate] = useState<number | "">("");
  const [reverseError, setReverseError] = useState<string | null>(null);

  // とりあえず関税率は 0% として扱う（US 版でちゃんとUIを作るならそこで管理）
  const customsRatePercent = 0;

  // ====== 配送 ======
  const {
    weight,
    setWeight,
    dimensions,
    setDimensions,
    shippingMode,
    setShippingMode,
    manualShipping,
    setManualShipping,
    selectedShippingJPY,
    shippingMethodLabel,
  } = useShipping();

  // ====== 利益計算・カテゴリ ======
  const {
    categoryOptions,
    selectedCategoryFee,
    setSelectedCategoryFee,
    originalPriceNumber,
    approxJPY,
    overThreshold,
    final,
    isEnabled,
  } = useProfitCalc({
    sellingPrice,
    costPrice,
    rate,
    currency,
    gbpRate,
    usdRate,
    selectedShippingJPY,
  });

  // ====== ローディング判定 ======
  const coreReady = rate !== null && categoryOptions.length > 0;
  const isLoadingAll = !coreReady && !timeoutReached;

  // ====== Modal ======
  const [isOpen, setIsOpen] = useState(false);

  // 入力の有無を分解してチェック
  const hasCost = typeof costPrice === "number";
  const hasTarget = typeof targetProfitRate === "number";
  const hasShipping = selectedShippingJPY != null;
  const hasCategory = typeof selectedCategoryFee === "number";
  const hasGBP = gbpRate != null;
  const hasUSD = usdRate != null;

  // 通貨ごとに必要なレート条件を分ける
  const hasRequiredRates = currency === "GBP" ? hasGBP : hasGBP && hasUSD;

  const canReverse =
    !isLoadingAll &&
    gbpRate != null &&
    hasRequiredRates &&
    hasCost &&
    hasTarget &&
    hasShipping &&
    hasCategory;

  // ====== 逆算ハンドラ ======
  async function handleReverseCalc() {
    setReverseError("");

    // 共通：何らかのレートが 0/undefined なら弾く
    if (!rate) {
      return setReverseError("為替レートが取得できていません。");
    }

    if (gbpRate == null) {
      return setReverseError("GBPレートが取得できていません。");
    }

    if (targetProfitRate === "" || Number(targetProfitRate) <= 0) {
      return setReverseError("目標利益率(%) を入力してください。");
    }

    if (costPrice === "" || !selectedShippingJPY) {
      return setReverseError("仕入れ値・配送料を入力してください。");
    }

    if (!selectedCategoryFee) {
      return setReverseError("カテゴリ手数料を選択してください。");
    }

    const margin = Number(targetProfitRate);

    const gbpRateSafe: number = gbpRate;
    try {
      // 1) まず GBP で逆算（UK の一本化エンジン）
      const resultGBP = calculateSellingPriceFromProfitRateUK({
        targetProfitRate: margin,
        costPriceJPY: Number(costPrice),
        shippingJPY: selectedShippingJPY || 0,
        categoryFeePercent: Number(selectedCategoryFee),
        customsRatePercent: 0,
        payoneerFeePercent: 2,
        exchangeRateGBPtoJPY: gbpRateSafe,
        profitMode: "pure",
        debug: true,
      });

      // 2) UK 逆算結果 (GBP) を USD にクロス変換
      if (currency === "USD") {
        if (!usdRate) {
          setReverseError("USDレートが取得できていません。");
          return;
        }

        // 1 GBP が何 USD か = (GBP→JPY) / (USD→JPY)
        const gbpToUsd = gbpRateSafe / usdRate;

        const usdPriceExVAT = resultGBP.priceGBPExVAT * gbpToUsd;

        setSellingPrice(Number(usdPriceExVAT.toFixed(2)));
        return;
      }

      // GBPモード
      const result = calculateSellingPriceFromProfitRateUK({
        targetProfitRate: margin,
        costPriceJPY: Number(costPrice),
        shippingJPY: selectedShippingJPY || 0,
        categoryFeePercent: Number(selectedCategoryFee),
        customsRatePercent,
        payoneerFeePercent: 2,
        exchangeRateGBPtoJPY: gbpRate!,
      });

      setSellingPrice(result.priceGBPExVAT);
    } catch (err) {
      setReverseError("計算に失敗しました。" + (err as Error).message);
    }
  }

  return (
    <div
      className={`
      py-2 transition-all duration-300
      ${isLoadingAll ? "blur-sm opacity-60" : "opacity-100 blur-0"}
    `}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="bg-linear-to-r from-blue-400/60 to-blue-600/40 bg-clip-text text-transparent">
            ProfitCalc (UK) – 逆算モード
          </span>
        </h1>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
          目標利益率(%)・仕入れ値・配送料・カテゴリ手数料から、 必要な売値 (GBP)
          を二分探索で逆算します。
        </p>

        {isLoadingAll && (
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>読み込み中...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* 左カラム */}
        <div className="flex-1 flex flex-col space-y-5">
          {/* 為替 */}
          <ExchangeRate onRateChange={handleRateChange} />

          {/* 仕入れ値 */}
          <div>
            {isLoadingAll ? (
              <>
                <div className="h-4 w-28 rounded bg-neutral-200 animate-pulse mb-2" />
                <div className="h-10 w-full rounded-md bg-neutral-200 animate-pulse" />
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">
                  仕入れ値 (円)
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={costPrice}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") return setCostPrice("");
                    const num = Math.max(0, Number(raw));
                    setCostPrice(num);
                  }}
                  placeholder="例: 5000"
                  className="w-full px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>

          {/* 目標利益率 */}
          <div>
            {isLoadingAll ? (
              <div className="h-10 w-full rounded-md bg-neutral-200 animate-pulse" />
            ) : (
              <>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">
                  目標利益率 (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={targetProfitRate}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") return setTargetProfitRate("");
                      const num = Math.max(0, Number(raw));
                      setTargetProfitRate(num);
                    }}
                    placeholder="例: 30"
                    className="w-32 px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-sm text-neutral-600">%</span>
                  <button
                    type="button"
                    onClick={handleReverseCalc}
                    className={`ml-auto inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold
                    ${
                      canReverse
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-neutral-300 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    売値を計算
                  </button>
                </div>
                {reverseError && (
                  <p className="mt-1 text-xs text-red-500">{reverseError}</p>
                )}
                <p className="mt-1 text-[11px] text-neutral-500 leading-snug">
                  仕入れ値・配送料・カテゴリ手数料・VAT / 両替手数料を含めて、
                  指定した利益率になるような売値(GBP)を自動で求めます。
                </p>
              </>
            )}
          </div>

          {/* 売値（計算結果） */}
          <div>
            {isLoadingAll ? (
              <>
                <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse mb-2" />
                <div className="h-10 w-full rounded-md bg-neutral-200 animate-pulse" />
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">
                  売値 (GBP, VAT抜き・計算結果)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => {
                    // 逆算値をちょっとだけ手動で調整したいとき用に開けておく
                    const raw = e.target.value;
                    if (raw === "") return setSellingPrice("");
                    let num = Math.max(0, Number(raw));
                    num = Math.floor(num * 100) / 100;
                    setSellingPrice(num);
                  }}
                  placeholder="逆算結果がここに入ります"
                  className="w-full px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>

          {/* 配送料モード */}
          <div>
            {isLoadingAll ? (
              <div className="mt-2 h-9 w-40 rounded-full bg-neutral-200 animate-pulse" />
            ) : (
              <div className="flex items-center justify-between mt-2">
                <span className="block text-sm font-semibold text-neutral-800">
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
                  <motion.span
                    layout
                    className="absolute h-7 w-7 rounded-full bg-white shadow"
                    style={{ left: 4, top: 4 }}
                    animate={{ x: shippingMode === "manual" ? 96 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                  <span
                    className={`w-1/2 text-center text-sm transition ${
                      shippingMode === "auto"
                        ? "font-semibold text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    自動
                  </span>
                  <span
                    className={`w-1/2 text-center text-sm transition ${
                      shippingMode === "manual"
                        ? "font-semibold text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    手動
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 配送料フォーム */}
          <div className="mt-1 rounded-lg min-h-[150px]">
            {isLoadingAll ? (
              <div className="h-36 w-full rounded-lg bg-neutral-200 animate-pulse" />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={shippingMode}
                  initial={{ opacity: 0, y: -12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 12, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  {shippingMode === "auto" ? (
                    <fieldset className="space-y-3">
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
                    </fieldset>
                  ) : (
                    <div>
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
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* カテゴリ手数料 */}
          <div>
            {isLoadingAll ? (
              <>
                <div className="h-4 w-28 rounded bg-neutral-200 animate-pulse mb-2" />
                <div className="h-10 w-full rounded-md bg-neutral-200 animate-pulse" />
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">
                  カテゴリ手数料
                </label>
                <select
                  value={selectedCategoryFee}
                  onChange={(e) =>
                    setSelectedCategoryFee(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border bg-white border-neutral-300 rounded-md shadow-sm"
                >
                  <option value="">カテゴリを選択してください</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.label} value={cat.value}>
                      {cat.label} ({cat.value}%)
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* 右カラム */}
        <div className="flex-1 flex flex-col space-y-5">
          {/* 配送方法 */}
          {isLoadingAll ? (
            <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm space-y-3">
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            </div>
          ) : (
            <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm space-y-1 text-sm text-neutral-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block h-4 w-1 rounded-full bg-blue-500" />
                <h2 className="text-sm font-semibold text-neutral-800">
                  配送方法
                </h2>
              </div>
              <p>配送方法: {shippingMethodLabel}</p>
              <p>
                配送料:{" "}
                {selectedShippingJPY !== null
                  ? `${selectedShippingJPY}円`
                  : "計算中..."}
              </p>
            </div>
          )}

          {/* 利益結果 */}
          {isLoadingAll ? (
            <div className="h-48 w-full rounded-xl bg-neutral-200 animate-pulse" />
          ) : (
            rate !== null &&
            sellingPrice !== "" && (
              <Result
                currency={currency}
                originalPrice={originalPriceNumber}
                priceJPY={approxJPY}
                finalData={final}
                exchangeRateGBPtoJPY={gbpRate ?? 0}
                exchangeRateUSDtoJPY={usdRate ?? 0}
                overThreshold={overThreshold}
              />
            )
          )}

          {/* 最終利益ボタン */}
          {isLoadingAll ? (
            <div className="h-12 w-full rounded-full bg-neutral-200 animate-pulse" />
          ) : (
            <AnimatePresence>
              {final && (
                <motion.button
                  key="final-profit-button"
                  onClick={() => setIsOpen(true)}
                  disabled={!isEnabled}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className={`mt-2 w-full px-8 py-4 text-lg rounded-full font-semibold ${
                    isEnabled
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-neutral-300 text-neutral-200 cursor-not-allowed"
                  }`}
                >
                  最終利益の詳細を見る
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* モーダル */}
      {final && (
        <FinalResultModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shippingMethod={shippingMethodLabel}
          shippingJPY={selectedShippingJPY || 0}
          data={final}
          exchangeRateGBPtoJPY={gbpRate!}
          currency={currency}
          exchangeRateUSDtoJPY={usdRate ?? 0}
        />
      )}
    </div>
  );
}
