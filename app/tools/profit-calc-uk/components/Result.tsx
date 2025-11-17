"use client";

import React from "react";
import { isUnder135GBP } from "@/lib/vatRule";

type FinalProfitDetail = {
  vatAmountGBP: number;
  vatAmountJPY?: number;
  vatToPayGBP?: number;
  vatToPayJPY?: number;
  sellingPriceGBP: number;
  adjustedPriceGBP: number;
};

type ResultProps = {
  originalPriceGBP: number;
  priceJPY: number;
  rate: number;
  includeVAT: boolean;
  exchangeRateGBPtoJPY: number;
  finalData?: FinalProfitDetail | null; // ← 追加：page.tsx から渡す
};

export default function Result(props: ResultProps) {
  const {
    originalPriceGBP, priceJPY, includeVAT, exchangeRateGBPtoJPY, finalData
  } = props;

  const overThreshold = !isUnder135GBP(originalPriceGBP);

  // --- ここがポイント：JPYのフォールバック ---
  const vatAmountJPY = finalData?.vatAmountJPY
    ?? (finalData ? Math.round(finalData.vatAmountGBP * exchangeRateGBPtoJPY) : undefined);

  const vatToPayJPY = finalData?.vatToPayJPY
    ?? (finalData?.vatToPayGBP !== undefined
        ? Math.round(finalData.vatToPayGBP * exchangeRateGBPtoJPY)
        : undefined);

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-2 text-gray-800">
      <p><span className="font-semibold">GBP価格(ポンド):</span> £{originalPriceGBP.toFixed(2)} / ¥{priceJPY.toLocaleString()}</p>
      <p><span className="font-semibold">135ポンド超過:</span> {overThreshold ? "はい" : "いいえ"}</p>
      <p><span className="font-semibold">VAT適用:</span> {includeVAT ? "含む" : "含まない"}</p>

      {finalData && (
        <>
          <hr className="border-gray-300 my-2" />
          <p><span className="font-semibold">■ VAT額:</span> £{finalData.vatAmountGBP.toFixed(2)} / ¥{vatAmountJPY?.toLocaleString() ?? "-"}</p>
          <p><span className="font-semibold">■ VAT込み価格:</span> £{finalData.adjustedPriceGBP.toFixed(2)} / ¥{Math.round(finalData.adjustedPriceGBP * exchangeRateGBPtoJPY).toLocaleString()}</p>
          <p><span className="font-semibold">■ VAT抜き価格:</span> £{finalData.sellingPriceGBP.toFixed(2)} / ¥{Math.round(finalData.sellingPriceGBP * exchangeRateGBPtoJPY).toLocaleString()}</p>
          {finalData.vatToPayGBP !== undefined && (
            <p><span className="font-semibold">■ 差額納付VAT:</span> £{finalData.vatToPayGBP.toFixed(2)} / ¥{vatToPayJPY?.toLocaleString() ?? "-"}</p>
          )}
        </>
      )}
    </div>
  );
}