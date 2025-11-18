"use client";

import React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getCheapestShipping, ShippingData } from "@/lib/shipping";
import Result from "./components/Result";
import { calculateFinalProfitDetail } from "@/lib/profitCalc";
import FinalResultModal from "./components/FinalResultModal";
import { motion, AnimatePresence } from "framer-motion";
import ExchangeRate from "./components/ExchangeRate";

// ここから型定義を追加
type ShippingResult = {
  method: string;
  price: number | null;
};

type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

// ★ 追加: 配送モード型
type ShippingMode = "auto" | "manual";

export default function Page() {
  // ====== State管理 ======
  const [rate, setRate] = useState<number | null>(null); // 「今選択中の通貨→JPY」
  const [currency, setCurrency] = useState<"GBP" | "USD">("GBP");
  const [gbpRate, setGbpRate] = useState<number | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [categoryOptions, setCategoryOptions] = useState<CategoryFeeType[]>([]);
  const [selectedCategoryFee, setSelectedCategoryFee] = useState<number | "">(
    ""
  );

  // ★ 追加: 配送モードと手動送料
  const [shippingMode, setShippingMode] = useState<ShippingMode>("auto");
  const [manualShipping, setManualShipping] = useState<number | "">("");

  //モーダル制御
  const [isOpen, setIsOpen] = useState(false);

  // ====== 送料関連 ======
  const result = useMemo<ShippingResult | null>(() => {
    // 手動モードの時は常に null
    if (shippingMode !== "auto") return null;

    // データが足りない時も null
    if (!shippingRates || weight == null || weight <= 0) return null;

    // 自動計算
    return getCheapestShipping(shippingRates, weight, dimensions);
  }, [shippingMode, shippingRates, weight, dimensions]);

  // ★ 追加: 自動/手動の送料を一元化
  const selectedShippingJPY: number | null =
    shippingMode === "manual"
      ? manualShipping === ""
        ? null
        : Number(manualShipping)
      : result?.price ?? null;

  const handleRateChange = useCallback(
    (newRate: number | null, newCurrency: "GBP" | "USD") => {
      // UI 用
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

  // ====== 初期データ読み込み ======
  useEffect(() => {
    fetch("/data/shipping.json")
      .then((res) => res.json())
      .then((data) => setShippingRates(data));
  }, []);

  useEffect(() => {
    fetch("/data/categoryFees.json")
      .then((res) => res.json())
      .then((data) => setCategoryOptions(data));
  }, []);

  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  // ====== ① 表示用：今の売値を円に直す ======
  const currentRate = rate ?? 0;
  const originalPriceNumber =
    typeof sellingPrice === "number" ? sellingPrice : 0;
  const approxJPY =
    currentRate && originalPriceNumber ? originalPriceNumber * currentRate : 0;

  // ====== ② 計算用：GBP売値を作る（USD→GBP 変換を含む） ======
  const sellingPriceGBPForCalc = useMemo(() => {
    if (typeof sellingPrice !== "number") return 0;

    // GBPモードのときはそのまま
    if (currency === "GBP") return sellingPrice;

    // USDモードのときは USD→GBP に変換
    if (!usdRate || !gbpRate) return 0;
    const usdToGbp = usdRate / gbpRate; // 1USD が何ポンドか
    return sellingPrice * usdToGbp;
  }, [sellingPrice, currency, usdRate, gbpRate]);

  // 135ポンド超過フラグ（VATルール判断用の情報表示）
  const overThreshold = sellingPriceGBPForCalc > 135;

  // ====== ③ 最終利益計算（常に GBP ベース） ======
  const final =
    sellingPriceGBPForCalc > 0 &&
    typeof costPrice === "number" &&
    gbpRate !== null &&
    selectedShippingJPY !== null &&
    selectedCategoryFee !== ""
      ? calculateFinalProfitDetail({
          sellingPriceGBP: sellingPriceGBPForCalc, // ★ GBPに統一
          costPriceJPY: costPrice,
          shippingJPY: selectedShippingJPY,
          categoryFeePercent: selectedCategoryFee as number,
          customsRatePercent: 1.35,
          payoneerFeePercent: 2,
          includeVAT: true, // VATは135ポンド未満なら内部で自動適用
          exchangeRateGBPtoJPY: gbpRate!,
        })
      : null;

  // ★ 変更: 手動時は weight/size が不要なので条件を送料入力必須に寄せる
  const isEnabled =
    sellingPrice !== "" &&
    costPrice !== "" &&
    rate !== null &&
    selectedCategoryFee !== "" &&
    selectedShippingJPY !== null;

  return (
    <div className="py-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="bg-linear-to-r from-blue-400/60 to-blue-600/40 bg-clip-text text-transparent">
            ProfitCalc (UK)
          </span>
        </h1>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
          仕入れ値・配送料・為替レートから利益率や詳細な数値を自動計算します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* 左カラム */}
        <div className="flex-1 flex flex-col space-y-5">
          {/* 為替レート表示コンポーネント（中でピンクカード） */}
          <ExchangeRate onRateChange={handleRateChange} />

          {/* 仕入れ値 */}
          <div>
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
                if (raw === "") {
                  setCostPrice("");
                  return;
                }
                let num = Number(raw);
                if (num < 0) num = 0;
                setCostPrice(num);
              }}
              placeholder="例: 5000"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 売値 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">
              売値 ({currency === "GBP" ? "£" : "$"})
            </label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setSellingPrice("");
                  return;
                }
                let num = Number(raw);
                if (num < 0) num = 0;
                num = Math.floor(num * 100) / 100; // 2桁固定
                setSellingPrice(num);
              }}
              placeholder="例: 200"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {rate !== null && sellingPrice !== "" && (
              <p className="mt-1 text-xs text-neutral-500">
                概算円価格：約 {Math.round(Number(sellingPrice) * rate)} 円
              </p>
            )}
          </div>

          {/* 配送料モードトグル */}
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
              {/* ノブ */}
              <motion.span
                layout
                className="absolute h-7 w-7 rounded-full bg-white shadow"
                style={{ left: 4, top: 4 }}
                animate={{ x: shippingMode === "manual" ? 96 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
              {/* ラベル */}
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

          {/* 自動フォーム or 手動フォーム（切替） */}
          <div className="mt-1 rounded-lg min-h-[150px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={shippingMode}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 12, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  overflow: "hidden",
                  willChange: "opacity, transform, height",
                }}
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
                        placeholder="実重量"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="px-2 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="px-2 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="px-2 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </fieldset>
                ) : (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold text-neutral-800 mb-1">
                      配送料（円・手動）
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={10}
                      value={manualShipping}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          setManualShipping("");
                          return;
                        }
                        const num = Math.max(0, Number(raw));
                        setManualShipping(Number.isFinite(num) ? num : "");
                      }}
                      placeholder="例: 1200"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      ※ 手動入力時は重量/サイズは非表示になります
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* カテゴリ手数料 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">
              カテゴリ手数料
            </label>
            <select
              value={selectedCategoryFee}
              onChange={(e) => setSelectedCategoryFee(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="flex-1 flex flex-col space-y-5">
          {/* 配送方法 */}
          <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm space-y-1 text-sm text-neutral-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-4 w-1 rounded-full bg-blue-500" />
              <h2 className="text-sm font-semibold text-neutral-800">
                配送方法
              </h2>
            </div>

            <p>
              配送方法:{" "}
              {shippingMode === "manual"
                ? "手動入力"
                : result === null
                ? "計算中..."
                : result.method}
            </p>

            <p>
              配送料:{" "}
              {selectedShippingJPY !== null
                ? `${selectedShippingJPY}円`
                : "計算中..."}
            </p>
          </div>

          {/* 利益結果 */}
          {rate !== null && sellingPrice !== "" && (
            <Result
              currency={currency}
              originalPrice={originalPriceNumber}
              priceJPY={approxJPY}
              finalData={final}
              exchangeRateGBPtoJPY={gbpRate ?? 0}
              exchangeRateUSDtoJPY={usdRate ?? 0}
              overThreshold={overThreshold}
            />
          )}

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
        </div>
      </div>

      {final && (
        <FinalResultModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          shippingMethod={
            shippingMode === "manual" ? "手動入力" : result?.method || ""
          }
          shippingJPY={selectedShippingJPY || 0}
          data={final}
          exchangeRateGBPtoJPY={rate!}
        />
      )}
    </div>
  );
}
