// app/tools/profit-calc-us/hooks/usePolicySummaryUS.ts
"use client";

import type {
  DutyCalcResultUS,
  FinalWithDutyUS,
} from "@/lib/profit-calc-us/types";

type CalcResultLike = {
  sellingPriceJPY?: number | null;
};

type PolicySummaryUS = {
  sellingUsd: number;
  policyAmountUsd: number;
  profitMarginPercent: number;
  purchaseAmountUsd: number;
};

const STATE_TAX_RATE_US = 0.0671; // 6.71%

const toUsd = (v: number) => Number(v.toFixed(2));

type Params = {
  sellingPriceNum: number;
  dutyResult: DutyCalcResultUS | null;
  calcResult: CalcResultLike | null;
  finalWithDuty: FinalWithDutyUS | null;
};

export function usePolicySummaryUS({
  sellingPriceNum,
  dutyResult,
  calcResult,
  finalWithDuty,
}: Params): PolicySummaryUS | null {
  if (!dutyResult || !calcResult || !finalWithDuty) return null;

  const I8 = sellingPriceNum; // 売値 USD
  const M15 = dutyResult.shippingSafetyMarkupUsd; // 設定ポリシー USD
  const J17 = dutyResult.dutyUsd; // 関税額 USD

  const J18 = toUsd(M15 - J17);
  const J19 = toUsd(I8 - J18);
  const J20 = toUsd(J19 * STATE_TAX_RATE_US);

  const R8 = toUsd(J19 - J20);
  const U8 = toUsd(R8 + M15 - J20);

  return {
    sellingUsd: R8,
    policyAmountUsd: M15,
    profitMarginPercent:
    (finalWithDuty.finalProfitJPY / (calcResult.sellingPriceJPY || 1)) * 100,
    purchaseAmountUsd: U8,
  };
}
