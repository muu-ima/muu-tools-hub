// app/tools/profit-calc-us/views/DutyView.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExchangeRate from "@/app/tools/profit-calc-us/components/ExchangeRate";
import Result from "@/app/tools/profit-calc-us/components/Result";
import FinalResultModal from "@/app/tools/profit-calc-us/components/FinalResultModal";
import DutyResultCard from "@/app/tools/profit-calc-us/components/DutyResultCard";

import { useShippingUS } from "@/app/tools/profit-calc-us/hooks/useShippingUS";
import { useCategoryFeeUS } from "@/app/tools/profit-calc-us/hooks/useCategoryFeeUS";
import { useProfitCalcUS } from "@/app/tools/profit-calc-us/hooks/useProfitCalcUS";

import { useTimeout } from "@/app/tools/profit-calc-uk/hooks/useTimeout";

import {
  ORIGIN_RATES_US,
  HTS_RATES_US,
  findOriginByName,
  findHtsByCode,
  calculateDutyUS,
  type DutyCalcResultUS,
  type FinalWithDutyUS,
} from "@/lib/profit-calc-us";

export default function DutyView() {
  // ====== State ======
  const [rate, setRate] = useState<number | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<string>("");

  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedHts, setSelectedHts] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  // タイマー（ローディング演出）
  const timeoutReached = useTimeout(5000);

  // 配送
  const {
    weight,
    setWeight,
    dimensions,
    setDimensions,
    result: shippingResult,
    isLoading: isShippingLoading,
  } = useShippingUS();

  // カテゴリ手数料
  const { categoryOptions, selectedCategoryFee, setSelectedCategoryFee } =
    useCategoryFeeUS();

  // 為替ログ
  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  // 利益計算（既存 US コア）
  const { calcResult, final, isEnabled } = useProfitCalcUS({
    sellingPrice,
    costPrice,
    rate,
    result: shippingResult,
    selectedCategoryFee,
  });

  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;

  // 原産国 / HTS の選択データ
  const origin = useMemo(
    () => (selectedOrigin ? findOriginByName(selectedOrigin) ?? null : null),
    [selectedOrigin]
  );

  const hts = useMemo(
    () => (selectedHts ? findHtsByCode(selectedHts) ?? null : null),
    [selectedHts]
  );

  // ====== 関税ブロック計算 ======
  let dutyResult: DutyCalcResultUS | null = null;
  let finalWithDuty: FinalWithDutyUS | null = null;
  let declaredSummary: {
    declaredShippingUsd: number;
    chargedShippingUsd: number;
    declaredValueUsd: number;
    safetyMarkupUsd: number; // ← 送料の上乗せ担保額を追加
    bandPolicyId?: number | null; // ← 使ってなければオプショナルでもOK
  } | null = null;

  if (
    rate !== null &&
    final &&
    calcResult &&
    origin &&
    hts &&
    sellingPriceNum > 0
  ) {
    // ================================
    // 🚚 実際の送料JPYを使ってシートロジックを再現
    //   domesticShippingJpy = calcResult.shippingJPY
    // ================================
    const duty = calculateDutyUS({
      sellingUsd: sellingPriceNum,
      domesticShippingJpy: calcResult.shippingJPY, // ★ ここが超重要
      bankFx: rate,
      originRate: origin.rate,
      itemRate: hts.rate,
    });

    // DutyResultCard 用の申告サマリ
    declaredSummary = {
      declaredShippingUsd: duty.customsShippingUsd, // 申告上の送料USD
      chargedShippingUsd: duty.customsShippingUsd, // 実請求送料も同じでOK
      declaredValueUsd: duty.baseUsd, // 申告額（合計USD）
      bandPolicyId: null, // 必要なら duty に足してもよい
      safetyMarkupUsd: duty.shippingSafetyMarkupUsd,
    };

    const customsTotalJpy =
      duty.customsFeeJpy + duty.mpfJpy + duty.disbursementJpy;

    // 利益に関税を反映
    finalWithDuty = {
      baseProfitJPY: final.profitJPY,
      customsFeeJpy: customsTotalJpy,
      finalProfitJPY: final.profitJPY - customsTotalJpy,
      profitDiffJPY: -customsTotalJpy,
    };

    dutyResult = duty;
  }

  const originLabel = origin
    ? `${origin.name}（${Math.round(origin.rate * 100)}%）`
    : undefined;

  const htsLabel = hts
    ? `${hts.code} ${hts.name}（${Math.round(hts.rate * 100)}%）`
    : undefined;

  // ローディング判定
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Duty (US)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          関税計算を含めて最終利益を確認するモードです
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        {/* 左カラム：入力 */}
        <div className="flex-1 flex flex-col space-y-4">
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
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1 bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1 bg-white border-neutral-300 rounded-md"
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
                className="px-2 py-1 bg-white border-neutral-300 rounded-md"
              />
            </div>
          </div>

          {/* カテゴリ手数料 */}
          <div>
            <label className="block font-semibold mb-1">カテゴリ手数料</label>
            <select
              value={selectedCategoryFee}
              onChange={(e) => setSelectedCategoryFee(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
            >
              <option value="">カテゴリを選択してください</option>
              {categoryOptions.map((cat) => (
                <option key={cat.label} value={cat.value}>
                  {cat.label} ({cat.value}%)
                </option>
              ))}
            </select>
          </div>

          {/* 原産国 */}
          <div>
            <label className="block font-semibold mb-1">原産国 (Country)</label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
            >
              <option value="">原産国を選択</option>
              {ORIGIN_RATES_US.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}（{Math.round(o.rate * 100)}%）
                </option>
              ))}
            </select>
          </div>

          {/* HTS コード */}
          <div>
            <label className="block font-semibold mb-1">
              HTSコード（品目）
            </label>
            <select
              value={selectedHts}
              onChange={(e) => setSelectedHts(e.target.value)}
              className="w-full px-3 py-2 bg-white border-neutral-300 rounded-md"
            >
              <option value="">HTSコードを選択</option>
              {HTS_RATES_US.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.code}（{Math.round(h.rate * 100)}%）
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右カラム：結果 */}
        <div className="flex-1 flex flex-col space-y-4">
          {/* 配送結果 */}
          <div className="w-full px-4 py-4 bg-white border border-neutral-300 rounded-lg shadow-sm">
            {isShippingLoading ? (
              <>
                <p className="text-sm text-neutral-700">配送方法: 計算中...</p>
                <p className="text-sm text-neutral-700">配送料: 計算中...</p>
              </>
            ) : shippingResult === null ? (
              <>
                <p className="text-sm text-neutral-700">配送方法: 未計算</p>
                <p className="text-sm text-neutral-700">配送料: 未計算</p>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-700">
                  配送方法: {shippingResult.method}
                </p>
                <p className="text-sm text-neutral-700">
                  配送料: {shippingResult.price}円
                </p>
              </>
            )}
          </div>

          {/* 既存の利益結果 */}
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

          {/* 関税カード */}
          <DutyResultCard
            duty={dutyResult}
            finalWithDuty={finalWithDuty}
            originLabel={originLabel}
            htsLabel={htsLabel}
            exchangeRateUSDtoJPY={rate ?? 0}
            declaredSummary={declaredSummary}
          />

          {declaredSummary && (
            <p className="text-sm bg-white-50 text-neutral-700">
              送料の上乗せ担保額：+{declaredSummary.safetyMarkupUsd.toFixed(2)}{" "}
              USD
            </p>
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
