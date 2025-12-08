import type { DutyCalcParamsUS, DutyCalcResultUS } from "./types";

// Q14:Q20 の Shipping Policy バンド（シートと同じ）
const SHIPPING_POLICY_BANDS_USD = [7, 15, 30, 55, 80, 110, 180] as const;

/**
 * K12（仮の関税額）から、シートと同じルールで M15 を決める
 */
function pickShippingPolicyBand(k12: number): number {
  const bands = SHIPPING_POLICY_BANDS_USD;

  const greaterOrEqual = bands.filter((b) => b >= k12);
  const lessOrEqual = bands.filter((b) => b <= k12);

  const m18 = greaterOrEqual.length > 0 ? Math.min(...greaterOrEqual) : 110; // M18
  const m19 = lessOrEqual.length > 0 ? Math.max(...lessOrEqual) : 80; // M19

  const n18 = m18 - k12; // N18
  const n19 = m19 - k12; // N19
  const o19 = Math.abs(n19); // O19
  const o18 = Math.min(n18, o19); // O18

  // IF(O18=O19,M19,M18)
  return o18 === o19 ? m19 : m18;
}

/**
 * スプレッドシート右側「関税計算」をまる写し版
 */
export function calculateDutyUS(params: DutyCalcParamsUS): DutyCalcResultUS {
  const { sellingUsd, domesticShippingJpy, bankFx, originRate, itemRate } =
    params;

  if (!bankFx) {
    throw new Error("bankFx が 0 です");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[DutyUS] inputs", {
      "I8 sellingUsd": sellingUsd,
      "J8 domesticShippingJpy": domesticShippingJpy,
      "W10 bankFx": bankFx,
      "I11 originRate": originRate,
      "K11 itemRate": itemRate,
    });
  }

  const shippingUsd = domesticShippingJpy / bankFx; // V22
  const baseForPercentUsd = sellingUsd + shippingUsd; // W22
  const dutyRate = originRate + itemRate; // I11+K11
  const provisionalDutyUsd = baseForPercentUsd * dutyRate; // K12

  const shippingSafetyMarkupUsd = pickShippingPolicyBand(provisionalDutyUsd); // M15

  const declaredSeparateUsd = sellingUsd - shippingSafetyMarkupUsd; // J15
  const declaredTotalUsd = declaredSeparateUsd + shippingUsd; // J16
  const dutyUsd = +(declaredTotalUsd * dutyRate).toFixed(2); // J17

  const customsFeeJpy = Math.round(dutyUsd * bankFx);
  const MPF_USD = 2.62;
  const mpfJpy = Math.round(MPF_USD * bankFx);

  const flatDisbJpy = 4.5 * bankFx; // V26
  const percentDisbJpy = baseForPercentUsd * 0.02 * bankFx; // V27
  const disbursementJpy = Math.round(Math.max(flatDisbJpy, percentDisbJpy)); // V28

  if (process.env.NODE_ENV !== "production") {
    console.log("[DutyUS] steps", {
      "V22 shippingUsd": shippingUsd,
      "W22 baseForPercentUsd": baseForPercentUsd,
      "K12 provisionalDutyUsd": provisionalDutyUsd,
      "M15 shippingSafetyMarkupUsd": shippingSafetyMarkupUsd,
      "J15 declaredSeparateUsd": declaredSeparateUsd,
      "J16 declaredTotalUsd": declaredTotalUsd,
      "J17 dutyUsd": dutyUsd,
      "customsFeeJpy (Y26*W10)": customsFeeJpy,
      "V26 flatDisbJpy": flatDisbJpy,
      "V27 percentDisbJpy": percentDisbJpy,
      "V28 disbursementJpy": disbursementJpy,
    });
  }

  return {
    customsShippingUsd: shippingUsd,
    baseUsd: declaredTotalUsd,
    dutyUsd,
    disbursementJpy,
    mpfJpy,
    customsFeeJpy,
    shippingSafetyMarkupUsd,
    declaredSeparateUsd,
    declaredTotalUsd,
  };
}
