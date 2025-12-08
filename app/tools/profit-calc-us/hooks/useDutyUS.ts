"use client";

import { useMemo } from "react";
import {
  findOriginByName,
  findHtsByCode,
  calculateDutyUS,
  type DutyCalcResultUS,
  type FinalWithDutyUS,
} from "@/lib/profit-calc-us";

export type DutySummary = {
  declaredShippingUsd: number;
  chargedShippingUsd: number;
  declaredValueUsd: number;
  safetyMarkupUsd: number;
  bandPolicyId?: number | null;
};

type Params = {
  rate: number | null;
  sellingPriceNum: number;
  calcResult: { shippingJPY: number; sellingPriceJPY: number } | null;
  originName: string;
  htsCode: string;
  finalProfit: number | null;
  originRateFallback?: number;
};

export function useDutyUS(params: Params) {
  const {
    rate,
    sellingPriceNum,
    calcResult,
    originName,
    htsCode,
    finalProfit,
  } = params;

  // Origin / HTS
  const origin = useMemo(
    () => (originName ? findOriginByName(originName) ?? null : null),
    [originName]
  );

  const hts = useMemo(
    () => (htsCode ? findHtsByCode(htsCode) ?? null : null),
    [htsCode]
  );

  // Label
  const originLabel = origin
    ? `${origin.name}（${Math.round(origin.rate * 100)}%）`
    : undefined;

  const htsLabel = hts
    ? `${hts.code} ${hts.name}（${Math.round(hts.rate * 100)}%）`
    : undefined;

  // Duty 計算本体
  const { dutyResult, finalWithDuty, declaredSummary } = useMemo(() => {
    if (!rate || !calcResult || !origin || !hts || sellingPriceNum <= 0) {
      return {
        dutyResult: null as DutyCalcResultUS | null,
        finalWithDuty: null as FinalWithDutyUS | null,
        declaredSummary: null as DutySummary | null,
      };
    }

    const duty = calculateDutyUS({
      sellingUsd: sellingPriceNum,
      domesticShippingJpy: calcResult.shippingJPY,
      bankFx: rate,
      originRate: origin.rate,
      itemRate: hts.rate,
    });

    const customsTotalJpy =
      duty.customsFeeJpy + duty.disbursementJpy + duty.mpfJpy;

    const summary: DutySummary = {
      declaredShippingUsd: duty.customsShippingUsd,
      chargedShippingUsd: duty.customsShippingUsd,
      declaredValueUsd: duty.baseUsd,
      safetyMarkupUsd: duty.shippingSafetyMarkupUsd,
      bandPolicyId: null,
    };

    const finalDuty: FinalWithDutyUS = {
      baseProfitJPY: finalProfit ?? 0,
      customsFeeJpy: customsTotalJpy,
      finalProfitJPY: (finalProfit ?? 0) - customsTotalJpy,
      profitDiffJPY: -customsTotalJpy,
    };

    return {
      dutyResult: duty,
      finalWithDuty: finalDuty,
      declaredSummary: summary,
    };
  }, [rate, calcResult, origin, hts, sellingPriceNum, finalProfit]);

  return {
    origin,
    hts,
    originLabel,
    htsLabel,
    dutyResult,
    finalWithDuty,
    declaredSummary,
  };
}
