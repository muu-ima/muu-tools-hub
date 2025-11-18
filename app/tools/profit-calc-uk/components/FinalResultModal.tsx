"use client";

// import { isUnder135GBP, applyVAT } from "@/lib/vatRule";
import { FinalResultBaseProps } from "@/types/profit";

// 🔸 モーダル用に isOpen / onClose を追加した型
type FinalResultModalProps = FinalResultBaseProps & {
  isOpen: boolean;
  onClose: () => void;
  currency: "GBP" | "USD";
  exchangeRateUSDtoJPY?: number;
};

export default function FinalResult({
  isOpen,
  onClose,
  shippingMethod,
  shippingJPY,
  data,
  exchangeRateGBPtoJPY,
  currency,
  exchangeRateUSDtoJPY,
}: FinalResultModalProps) {
  if (!isOpen) return null;

  // ===== 通貨切り替え用ヘルパー =====
  const symbol = currency === "USD" ? "$" : "£";

  // GBP → USD のレート（両方のレートが揃っているときだけ有効）
  const gbpToUsd =
    exchangeRateUSDtoJPY && exchangeRateGBPtoJPY
      ? exchangeRateUSDtoJPY / exchangeRateGBPtoJPY
      : null;

  // GBP金額を表示通貨（GBP or USD）に変換
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

    // 円 → ドル（USDレートがない時はとりあえず GBP にフォールバック）
    if (!exchangeRateUSDtoJPY || exchangeRateGBPtoJPY <= 0) {
      return jpyAmount / exchangeRateGBPtoJPY;
    }

    return jpyAmount / exchangeRateUSDtoJPY;
  };

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
              <span className="font-semibold text-gray-700">■ 配送料:</span>
              {symbol}
              {jpyToPrimary(shippingJPY).toFixed(2)} / ¥
              {shippingJPY.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold text-gray-700">■ 仕入れ:</span>{" "}
              {symbol}
              {jpyToPrimary(data.costPriceJPY).toFixed(2)} / ¥
              {data.costPriceJPY.toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* 手数料・コスト */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold">■ カテゴリ手数料:</span>
              {symbol}
              {gbpToPrimary(data.categoryFeeGBP).toFixed(2)} / ¥
              {Math.round(
                data.categoryFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 関税:</span>
              {symbol}
              {gbpToPrimary(data.customsFeeGBP).toFixed(2)} / ¥
              {Math.round(
                data.customsFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ Payoneer手数料:</span>
              {symbol}
              {gbpToPrimary(data.payoneerFeeGBP).toFixed(2)} / ¥
              {Math.round(
                data.payoneerFeeGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ 両替手数料:</span>
              {symbol}
              {jpyToPrimary(data.exchangeFeeJPY).toFixed(2)} / ¥
              {data.exchangeFeeJPY.toLocaleString()}
            </p>
          </div>

          <hr className="border-gray-300" />

          {/* VAT関連 */}
          <div className="space-y-2">
            <p>
              <span className="font-semibold">■ VAT額:</span> 
              {symbol}
              {jpyToPrimary(data.vatAmountJPY).toFixed(2)} / ¥
              {data.vatAmountJPY.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ VAT込み価格:</span>{" "} 
              {symbol}
              {gbpToPrimary(data.adjustedPriceGBP).toFixed(2)} / ¥
              {Math.round(
                data.adjustedPriceGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">■ VAT抜き価格:</span>{" "}
              {symbol}
              {gbpToPrimary(data.sellingPriceGBP).toFixed(2)} / ¥
              {Math.round(
                data.sellingPriceGBP * exchangeRateGBPtoJPY
              ).toLocaleString()}
            </p>
            {data.vatToPayGBP !== undefined && (
              <p>
                <span className="font-semibold">■ 差額納付VAT:</span>{" "}
                {symbol}
                {gbpToPrimary(data.vatToPayGBP).toFixed(2)}
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
              ※ 税還付金 : {symbol}
              {jpyToPrimary(data.exchangeAdjustmentJPY).toFixed(2)} {" "}
              / ¥{data.exchangeAdjustmentJPY.toLocaleString()}
            </p>
            <p>
              ※ 手数料還付金 : {symbol}
              {jpyToPrimary(data.feeRebateJPY).toFixed(2)}{" "}
               / ¥{data.feeRebateJPY.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
