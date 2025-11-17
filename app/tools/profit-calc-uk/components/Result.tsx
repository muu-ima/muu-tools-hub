"use client";

import React from "react";

type FinalProfitDetail = {
  vatAmountGBP: number;
  vatAmountJPY?: number;
  vatToPayGBP?: number;
  vatToPayJPY?: number;
  sellingPriceGBP: number;
  adjustedPriceGBP: number;
};

type ResultProps = {
  currency: "GBP" | "USD";      // 今どの通貨モードか
  originalPrice: number;        // 現在の通貨での売値
  priceJPY: number;             // 現在の通貨→円の概算
  overThreshold: boolean;       // 135ポンド超過か（親で計算済み）

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

  // VATの円換算（finalData に JPY が入ってなければ計算する）
  const vatAmountJPY =
    finalData?.vatAmountJPY ??
    (finalData
      ? Math.round(finalData.vatAmountGBP * exchangeRateGBPtoJPY)
      : undefined);

  const vatToPayJPY =
    finalData?.vatToPayJPY ??
    (finalData?.vatToPayGBP !== undefined
      ? Math.round(finalData.vatToPayGBP * exchangeRateGBPtoJPY)
      : undefined);

  // GBP→USD レート（両方あるときだけ計算）
  const gbpToUsd =
    exchangeRateGBPtoJPY > 0 && exchangeRateUSDtoJPY
      ? exchangeRateUSDtoJPY / exchangeRateGBPtoJPY
      : null;

  // 表示するVAT額（通貨モードに応じて £ / $ を出し分け）
  const primaryVatSymbol = currency === "USD" ? "$" : "£";
  const primaryVatValue =
    currency === "USD" && gbpToUsd && finalData
      ? finalData.vatAmountGBP * gbpToUsd // GBP → USD 換算
      : finalData?.vatAmountGBP ?? 0;     // GBPモード or レート不足時

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

          {/* VAT額：UIの通貨（GBP/ USD） + 円 */}
          <p>
            <span className="font-semibold">■ VAT額:</span> {primaryVatSymbol}
            {primaryVatValue.toFixed(2)} / ¥
            {vatAmountJPY?.toLocaleString() ?? "-"}
          </p>

          <p>
            <span className="font-semibold">■ VAT込み価格:</span> £
            {finalData.adjustedPriceGBP.toFixed(2)} / ¥
            {Math.round(
              finalData.adjustedPriceGBP * exchangeRateGBPtoJPY
            ).toLocaleString()}
          </p>

          <p>
            <span className="font-semibold">■ VAT抜き価格:</span> £
            {finalData.sellingPriceGBP.toFixed(2)} / ¥
            {Math.round(
              finalData.sellingPriceGBP * exchangeRateGBPtoJPY
            ).toLocaleString()}
          </p>

          {finalData.vatToPayGBP !== undefined && (
            <p>
              <span className="font-semibold">■ 差額納付VAT:</span> £
              {finalData.vatToPayGBP.toFixed(2)} / ¥
              {vatToPayJPY?.toLocaleString() ?? "-"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
