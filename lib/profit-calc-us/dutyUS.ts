// lib/profit-calc-us/dutyUS.ts

import type {
  DutyCalcParamsUS,
  DutyCalcResultUS,
  FinalWithDutyUS,
} from "./types";

/**
 * スプレッドシート右下の「関税計算」ブロックを再現
 */
export function calculateDutyUS(params: DutyCalcParamsUS): DutyCalcResultUS {
  const {
    sellingUsd,
    domesticShippingJpy,
    bankFx,
    originRate,
    itemRate,
    declaredValueUsd,
  } = params;

  if (!bankFx) {
    throw new Error("bankFx (為替レート) が 0 です。");
  }

  // 送料(USD) = 国内送料JPY / 為替レート
  const customsShippingUsd = domesticShippingJpy / bankFx;

  // 販売額 + 送料 (USD)
  const baseUsd = sellingUsd + customsShippingUsd;

  // 関税率 = 原産国 + 品目
  const dutyRate = originRate + itemRate;

  // 関税額(USD) = 申告価格 * (原産国+品目)
  const dutyUsd = declaredValueUsd * dutyRate;

  // Disbursement 円 = 4.5ドル固定 × 為替
  const disbursementJpy = 4.5 * bankFx;

  // MPF 円 = (販売額+送料) * 2% * 為替
  const mpfJpy = baseUsd * 0.02 * bankFx;

  // 関税合計 円 = 関税(USD)×為替 + Disbursement + MPF
  const customsFeeJpy = Math.round(dutyUsd * bankFx + disbursementJpy + mpfJpy);

  return {
    customsShippingUsd,
    baseUsd,
    dutyUsd,
    disbursementJpy,
    mpfJpy,
    customsFeeJpy,
  };
}

/**
 * 既存の「還付込み最終利益（profitJPY）」に関税を適用して
 * 「関税込み最終利益」を出す
 */
export function applyDutyToProfitUS(
  baseProfitJPY: number,
  duty: DutyCalcResultUS
): FinalWithDutyUS {
  const finalProfitJPY = baseProfitJPY - duty.customsFeeJpy;
  const profitDiffJPY = finalProfitJPY - baseProfitJPY;

  return {
    baseProfitJPY,
    customsFeeJpy: duty.customsFeeJpy,
    finalProfitJPY,
    profitDiffJPY,
  };
}
