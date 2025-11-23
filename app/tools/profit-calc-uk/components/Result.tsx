"use client";

import React from "react";

type FinalProfitDetail = {
  sellingPriceGBP: number;
  adjustedPriceGBP: number;
  vatAmountGBP: number;
  vatAmountJPY?: number;
  vatToPayGBP?: number;
};

type ResultProps = {
  currency: "GBP" | "USD"; // 今どの通貨モードか
  originalPrice: number; // 現在の通貨での売値
  priceJPY: number; // 現在の通貨→円の概算
  overThreshold: boolean; // 135ポンド超過か（親で計算済み）

  exchangeRateGBPtoJPY: number; // GBP→JPY
  exchangeRateUSDtoJPY?: number; // USD→JPY（USD表示用に使う）

  finalData?: FinalProfitDetail | null;
};

export default function Result({
  currency,
  originalPrice,
  priceJPY,
  exchangeRateGBPtoJPY,
  exchangeRateUSDtoJPY,
  finalData,
  overThreshold,
}: ResultProps) {
  // 通貨記号とラベル（左上の「売値」の表示用）
  const symbol = currency === "GBP" ? "£" : "$";
  const currencyLabel =
    currency === "GBP" ? "GBP価格 (ポンド)" : "USD価格 (ドル)";

  // 実際に VAT が発生しているかどうか
  const vatApplied = !!finalData && finalData.vatAmountGBP > 0.0001;

  // GBP → USD のクロスレート（両方のレートが揃っているときだけ有効）
  const gbpToUsd =
    exchangeRateUSDtoJPY && exchangeRateGBPtoJPY > 0
      ? exchangeRateGBPtoJPY / exchangeRateUSDtoJPY
      : null;

  // GBP金額を表示通貨 (GBP or USD) に変換
  const gbpToPrimary = (gbpAmount: number) => {
    if (currency === "GBP" || !gbpToUsd) return gbpAmount;
    return gbpAmount * gbpToUsd;
  };

  // JPY金額を表示通貨に変換（「/ ¥xxxx」の左側に出す値）
  const jpyToPrimary = (jpyAmount: number) => {
    if (!exchangeRateGBPtoJPY || exchangeRateGBPtoJPY <= 0) return 0;

    if (currency === "GBP") {
      return jpyAmount / exchangeRateGBPtoJPY;
    }

    // 円 → ドル (USDレートがない時はとりあえず GBP にフォールバック)
    if (!exchangeRateUSDtoJPY || exchangeRateUSDtoJPY <= 0) {
      return jpyAmount / exchangeRateGBPtoJPY;
    }
    return jpyAmount / exchangeRateUSDtoJPY;
  };

  const vatAmountJPY = finalData?.vatAmountJPY ?? 0;

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-2 text-gray-800">
      {/* ここが通貨トグルで変わる部分 */}
      <p>
        <span className="font-semibold">{currencyLabel}:</span> {symbol}
        {originalPrice.toFixed(2)} / ¥{priceJPY.toLocaleString()}
      </p>

      <p>
        <span className="font-semibold">135ポンド超過:</span>{" "}
        {overThreshold ? "はい" : "いいえ"}
      </p>

      <p>
        <span className="font-semibold">VAT適用:</span>{" "}
        {finalData ? (vatApplied ? "含む" : "含まない") : "未計算"}
      </p>

      {finalData && (
        <>
          <hr className="border-gray-300 my-2" />

          {/* VAT額：モーダルと同じロジック（JPY → 表示通貨） */}
          <p>
            <span className="font-semibold">■ VAT額:</span> {symbol}
            {jpyToPrimary(vatAmountJPY).toFixed(2)} / ¥
            {vatAmountJPY.toLocaleString()}
          </p>

          <p>
            <span className="font-semibold">■ VAT込み価格:</span> {symbol}
            {gbpToPrimary(finalData.adjustedPriceGBP).toFixed(2)} / ¥
            {Math.round(
              finalData.adjustedPriceGBP * exchangeRateGBPtoJPY
            ).toLocaleString()}
          </p>

          <p>
            <span className="font-semibold">■ VAT抜き価格:</span> {symbol}
            {gbpToPrimary(finalData.sellingPriceGBP).toFixed(2)} / ¥
            {Math.round(
              finalData.sellingPriceGBP * exchangeRateGBPtoJPY
            ).toLocaleString()}
          </p>

          {finalData.vatToPayGBP !== undefined && (
            <p>
              <span className="font-semibold">■ 差額納付VAT:</span> {symbol}
              {gbpToPrimary(finalData.vatToPayGBP).toFixed(2)} / ¥
              {Math.round(
                finalData.sellingPriceGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
