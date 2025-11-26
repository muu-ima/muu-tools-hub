"use client";

import { FinalProfitDetailUS } from "@/types/profitUS";

type FinalResultProps = {
  isOpen: boolean;
  onClose: () => void;
  shippingMethod: string;
  shippingJPY: number;
  data: FinalProfitDetailUS;
  exchangeRateUSDtoJPY: number;
  hideProfitRate?: boolean;
};

export default function FinalResult({
  isOpen,
  onClose,
  shippingMethod,
  shippingJPY,
  data,
  exchangeRateUSDtoJPY,
  hideProfitRate,
}: FinalResultProps) {
  if (!isOpen) return null;

  const symbol = "$";
  const rate = exchangeRateUSDtoJPY || 1; // 0ガード

  const usdToJPY = (usd: number) => usd * rate;
  const jpyToUSD = (jpy: number) => (rate > 0 ? jpy / rate : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* 背景クリックで閉じる */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="モーダルを閉じる"
      />

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border rounded-xl shadow-lg bg-white space-y-6 text-base text-gray-800">
          <h2 className="text-2xl font-bold">【最終利益の詳細（US）】</h2>

          {/* 基本情報 */}
          <div className="space-y-1">
            <p>
              <span className="font-semibold">■ 売上 (税抜):</span>{" "}
              {symbol}
              {data.sellingPrice.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.sellingPrice)).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 州税込売上:</span>{" "}
              {symbol}
              {data.sellingPriceInclTax.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.sellingPriceInclTax)).toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* 配送・仕入れ */}
          <div className="space-y-1">
            <p>
              <span className="font-semibold">■ 配送方法:</span>{" "}
              {shippingMethod}
            </p>
            <p>
              <span className="font-semibold">■ 配送料:</span>{" "}
              {symbol}
              {jpyToUSD(shippingJPY).toFixed(2)} / ￥
              {shippingJPY.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 仕入れ:</span>{" "}
              {symbol}
              {jpyToUSD(data.costPrice).toFixed(2)} / ￥
              {data.costPrice.toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* 手数料まわり */}
          <div className="space-y-1">
            <p className="text-gray-600 font-semibold my-1">
              【州税込売上から計算】
            </p>
            <p>
              <span className="font-semibold">■ カテゴリ手数料:</span>{" "}
              {symbol}
              {data.categoryFeeUSD.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.categoryFeeUSD)).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 決済手数料:</span>{" "}
              {symbol}
              {data.paymentFeeUSD.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.paymentFeeUSD)).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 手数料税:</span>{" "}
              {symbol}
              {data.feeTaxUSD.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.feeTaxUSD)).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ Payoneer手数料:</span>{" "}
              {symbol}
              {data.payoneerFeeUSD.toFixed(2)} / ￥
              {Math.round(usdToJPY(data.payoneerFeeUSD)).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 為替手数料:</span>{" "}
              {symbol}
              {jpyToUSD(data.exchangeFeeJPY).toFixed(2)} / ￥
              {data.exchangeFeeJPY.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* 損益結果ブロック */}
          <div className="p-6 bg-gray-50 rounded-lg space-y-6 mt-2">
            <h3 className="text-xl font-bold border-b pb-2">【損益結果】</h3>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                利益 (売上 - 仕入 - 送料)
              </span>
              <div className="text-right">
                <span className="block text-gray-500 text-sm">USD</span>
                <span className="text-lg font-semibold text-gray-700">
                  {(data.netProfitJPY / rate).toFixed(2)}
                </span>
                <span className="block text-sm mt-1 text-gray-500">JPY</span>
                <span className="text-2xl font-bold text-gray-900">
                  ￥
                  {data.netProfitJPY.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-gray-700 font-medium">
                最終損益（還付金付与後）
              </span>
              <div className="text-right">
                <span className="block text-gray-500 text-sm">USD</span>
                <span className="text-lg font-semibold text-gray-700">
                  {(data.profitJPY / rate).toFixed(2)}
                </span>
                <span className="block text-sm mt-1 text-gray-500">JPY</span>
                <span className="text-2xl font-bold text-gray-900">
                  ￥
                  {data.profitJPY.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            {!hideProfitRate && (
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-700 font-medium">利益率</span>
                <span className="text-2xl font-bold text-green-600">
                  {data.profitMargin.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <hr className="border-gray-300" />

          {/* 還付金メモ */}
          <p className="text-gray-500 text-sm">
            ※ 税還付金 : {(data.exchangeAdjustmentJPY / rate).toFixed(2)} / ￥
            {data.exchangeAdjustmentJPY.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            <br />
            ※ 手数料還付金 :
            {(data.feeRebateJPY / rate).toFixed(2)} / ￥
            {data.feeRebateJPY.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
