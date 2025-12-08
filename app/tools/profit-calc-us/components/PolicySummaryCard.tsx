"use client";

type Props = {
  summary: {
    sellingUsd: number; // 販売額
    policyAmountUsd: number; // Shipping Policy ID
    profitMarginPercent: number; // 関税込み最終利益率(%)
    purchaseAmountUsd: number; // 購入金額的な値（申告合計など）
  };
};

export default function PolicySummaryCard({ summary }: Props) {
  const {
    sellingUsd,
    policyAmountUsd,
    profitMarginPercent,
    purchaseAmountUsd,
  } = summary;

  return (
    <div className="rounded-2xl bg-white shadow p-5 border border-neutral-200">
      <h2 className="text-lg font-bold mb-4">販売・ポリシー概要（US）</h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-600">販売額（USD）</span>
          <span className="font-bold">${sellingUsd.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-600">設定ポリシー</span>
          <span className="font-bold">{policyAmountUsd ?? "―"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-600">利益率</span>
          <span className="font-bold">{profitMarginPercent.toFixed(2)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-600">購入金額（USD）</span>
          <span className="font-bold">${purchaseAmountUsd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
