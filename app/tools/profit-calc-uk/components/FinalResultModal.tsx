"use client";

// import { isUnder135GBP, applyVAT } from "@/lib/vatRule";
import { FinalResultBaseProps } from "@/types/profit";

// 🔸 モーダル用に isOpen / onClose を追加した型
type FinalResultModalProps = FinalResultBaseProps & {
  isOpen: boolean;
  onClose: () => void;
};

export default function FinalResult({
  isOpen,
  onClose,
  shippingMethod,
  shippingJPY,
  data,
  exchangeRateGBPtoJPY,
}: FinalResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="モーダルを閉じる"
      />
      <div
        className="
    relative 
    z-10 
    w-full 
    max-w-4xl
     bg-white 
     rounded-2xl 
     shadow-2xl
    p-8 max-h-[90vh]
    overflow-y-auto
    "
      >
        <div className="p-6 border rounded-xl shadow-lg bg-white space-y-6 text-base text-gray-800">
          <h2 className="text-2xl font-bold">【最終利益の詳細】</h2>

          {/* 基本情報 */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-gray-700">■ 配送方法:</span>{" "}
              {shippingMethod}
            </p>
            <p>
              <span className="font-semibold text-gray-700">■ 配送料:</span> £
              {(shippingJPY / exchangeRateGBPtoJPY).toFixed(2)} / ¥
              {shippingJPY.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold text-gray-700">■ 仕入れ:</span> £
              {(data.costPriceJPY / exchangeRateGBPtoJPY).toFixed(2)} / ¥
              {data.costPriceJPY.toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* 手数料・コスト */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold">■ カテゴリ手数料:</span> £
              {data.categoryFeeGBP.toFixed(2)} / ¥
              {Math.round(
                data.categoryFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 関税:</span> £
              {data.customsFeeGBP.toFixed(2)} / ¥
              {Math.round(
                data.customsFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ Payoneer手数料:</span> £
              {data.payoneerFeeGBP.toFixed(2)} / ¥
              {Math.round(
                data.payoneerFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 両替手数料:</span> £
              {(data.adjustedPriceGBP / exchangeRateGBPtoJPY).toFixed(2)} / ¥
              {data.exchangeFeeJPY.toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* VAT関連 */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold">■ VAT額:</span> £
              {(data.vatAmountJPY / exchangeRateGBPtoJPY).toFixed(2)} / ¥
              {data.vatAmountJPY.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ VAT込み価格:</span> £
              {data.adjustedPriceGBP.toFixed(2)} / ¥
              {Math.round(
                data.adjustedPriceGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ VAT抜き価格:</span> £
              {data.sellingPriceGBP.toFixed(2)} / ¥
              {Math.round(
                data.sellingPriceGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            {data.vatToPayGBP !== undefined && (
              <p>
                <span className="font-semibold">■ 差額納付VAT:</span> £
                {data.vatToPayGBP.toFixed(2)}
              </p>
            )}
          </div>

          <hr className="border-gray-300" />

          {/* 利益 */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold">
                ■ 利益（売上 - 仕入 - 送料）:
              </span>
              ¥{Math.ceil(data.netProfitJPY).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold text-green-700">■ 最終利益:</span>
              <span className="text-green-600 font-bold">
                ¥{Math.ceil(data.finalProfitJPY).toLocaleString()}
              </span>
            </p>
          </div>

          {/* 利益率 */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-700 font-medium">利益率</span>
            <span className="text-3xl font-bold text-green-600">
              {data.profitMargin.toFixed(2)}%
            </span>
          </div>

          {/* 還付金メモ */}
          <div className="text-gray-500 text-sm space-y-1 pt-2 border-t">
            <p>
              ※ 税還付金 : £
              {(data.exchangeAdjustmentJPY / exchangeRateGBPtoJPY).toFixed(2)} /
              ¥{data.exchangeAdjustmentJPY.toLocaleString()}
            </p>
            <p>
              ※ 手数料還付金 : £
              {(data.feeRebateJPY / exchangeRateGBPtoJPY).toFixed(2)} / ¥
              {data.feeRebateJPY.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
