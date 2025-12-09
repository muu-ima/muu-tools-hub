// app/tools/profit-calc-us/components/DutyResultCard.tsx
"use client";

import type {
  DutyCalcResultUS,
  FinalWithDutyUS,
} from "@/lib/profit-calc-us/types";

type Props = {
  duty: DutyCalcResultUS | null;
  finalWithDuty: FinalWithDutyUS | null;
  originLabel?: string; // 例: "China (30%)"
  htsLabel?: string; // 例: "4202.92 バッグ (48%)"
  exchangeRateUSDtoJPY: number;
  // 👇 これを追加
  declaredSummary?: {
    declaredShippingUsd: number;
    chargedShippingUsd: number;
    declaredValueUsd: number;
    safetyMarkupUsd: number;
    bandPolicyId?: number | null;
  } | null;
};

const nfUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const nfJpy = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export default function DutyResultCard({
  duty,
  finalWithDuty,
  originLabel,
  htsLabel,
  exchangeRateUSDtoJPY,
  declaredSummary,
}: Props) {
  if (!duty || !finalWithDuty) {
    return (
      <div className="mt-4 px-4 py-3 rounded-lg border border-dashed border-neutral-300 bg-white/70 text-sm text-neutral-500">
        関税計算に必要な情報がまだ揃っていません。
        <br />
        原産国・HTSコード・売値・送料などを入力すると、ここに関税込みの結果が表示されます。
      </div>
    );
  }

  const { baseUsd, dutyUsd, disbursementJpy, mpfJpy, customsFeeJpy } = duty;

  const { baseProfitJPY, finalProfitJPY, profitDiffJPY } = finalWithDuty;

  return (
    <div className="mt3 w-full px-4 py-5 bg-white border border-neutral-300 rounded-xl shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-neutral-800">
        関税計算 (Duty / US)
      </h2>

      {/* 上段：原産国・HTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-neutral-500 text-xs mb-1">原産国</p>
          <p className="font-medium text-neutral-800">
            {originLabel ?? "未選択"}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">HTSコード（品目）</p>
          <p className="font-medium text-neutral-800">{htsLabel ?? "未選択"}</p>
        </div>
      </div>

      {declaredSummary && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-neutral-500 text-xs mb-1">実送料（USD）</p>
            <p className="font-semibold text-neutral-800">
              {nfUsd.format(declaredSummary.chargedShippingUsd)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">関税用送料（USD）</p>
            <p className="font-semibold text-neutral-800">
              {nfUsd.format(declaredSummary.declaredShippingUsd)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">
              申告価格 合計（USD）
            </p>
            <p className="font-semibold text-neutral-800">
              {nfUsd.format(declaredSummary.declaredValueUsd)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">設定ポリシー</p>
            <span className="font-bold">
              {typeof declaredSummary.safetyMarkupUsd === "number"
                ? declaredSummary.safetyMarkupUsd.toFixed(0) // 80 / 55 など
                : "―"}
            </span>
          </div>
        </div>
      )}

      <hr className="border-dashed border-neutral-200" />

      {/* 中段：申告価格・関税・その他USD系 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-neutral-500 text-xs mb-1">販売額 + 送料（USD）</p>
          <p className="font-semibold text-neutral-800">
            {nfUsd.format(baseUsd)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">関税額（USD）</p>
          <p className="font-semibold text-neutral-800">
            {nfUsd.format(dutyUsd)}
          </p>
        </div>
      </div>

      <hr className="border-dashed border-neutral-200" />

      {/* 下段：円建ての費用明細 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-neutral-500 text-xs mb-1">Disbursement（円）</p>
          <p className="font-semibold text-neutral-800">
            {nfJpy.format(disbursementJpy)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">
            MPF（輸入者手数料 / 円）
          </p>
          <p className="font-semibold text-neutral-800">
            {nfJpy.format(mpfJpy)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">
            関税 + 手数料 合計（円）
          </p>
          <p className="font-semibold text-rose-600">
            {nfJpy.format(customsFeeJpy)}
          </p>
        </div>
      </div>

      <hr className="border-dashed border-neutral-200" />

      {/* 最終利益への影響 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-neutral-500 text-xs mb-1">関税前 最終利益（円）</p>
          <p className="font-semibold text-neutral-800">
            {nfJpy.format(baseProfitJPY)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">関税後 最終利益（円）</p>
          <p className="font-semibold text-emerald-700">
            {nfJpy.format(finalProfitJPY)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs mb-1">関税による増減（円）</p>
          <p
            className={`font-semibold ${
              profitDiffJPY >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {profitDiffJPY >= 0 ? "＋" : "−"}
            {nfJpy.format(Math.abs(profitDiffJPY))}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-neutral-400">
        ※ 為替レート: {exchangeRateUSDtoJPY.toFixed(3)} 円 / USD を使用して換算
      </p>
    </div>
  );
}
