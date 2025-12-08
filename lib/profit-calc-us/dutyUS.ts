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
  const m19 = lessOrEqual.length > 0 ? Math.max(...lessOrEqual) : 80;       // M19

  const n18 = m18 - k12;                 // N18
  const n19 = m19 - k12;                 // N19
  const o19 = Math.abs(n19);             // O19
  const o18 = Math.min(n18, o19);        // O18

  // IF(O18=O19,M19,M18)
  return o18 === o19 ? m19 : m18;
}

/**
 * スプレッドシート右側「関税計算」をまる写し版
 */
export function calculateDutyUS(params: DutyCalcParamsUS): DutyCalcResultUS {
  const {
    sellingUsd,           // I8
    domesticShippingJpy,  // J8
    bankFx,               // W10
    originRate,           // I11
    itemRate,             // K11
  } = params;

  if (!bankFx) {
    throw new Error("bankFx が 0 です");
  }

  // ===== V22: 実送料USD =====
  const shippingUsd = domesticShippingJpy / bankFx;

  // ===== W22: base（売値 + 送料）=====
  const baseForPercentUsd = sellingUsd + shippingUsd;

  // ===== K12: 仮の関税額（Policy 判定用）=====
  const dutyRate = originRate + itemRate; // I11 + K11
  const provisionalDutyUsd = baseForPercentUsd * dutyRate;

  // ===== M15: Shipping Policy バンド選択 =====
  const shippingSafetyMarkupUsd = pickShippingPolicyBand(provisionalDutyUsd);

  // ===== J15 / J16: 送料別・合計 申告額 =====
  const declaredSeparateUsd = sellingUsd - shippingSafetyMarkupUsd; // J15
  const declaredTotalUsd = declaredSeparateUsd + shippingUsd;     // J16

  // ===== J17: 関税（USD）=====
  const dutyUsd = +(declaredTotalUsd * dutyRate).toFixed(2);

  // ===== 関税JPY（Y26*W10 相当）=====
  const customsFeeJpy = Math.round(dutyUsd * bankFx);

  // ===== MPF: 2.62 USD 固定（W26, W27）=====
  const MPF_USD = 2.62;
  const mpfJpy = Math.round(MPF_USD * bankFx);

  // ===== Disbursement: V26 / V27 / V28 =====
  const flatDisbJpy = 4.5 * bankFx;                         // V26
  const percentDisbJpy = baseForPercentUsd * 0.02 * bankFx; // V27
  const disbursementJpy = Math.round(
    Math.max(flatDisbJpy, percentDisbJpy)
  ); // V28

  console.log("shippingUsd", shippingUsd);             // ≒ 6.24
  console.log("declaredSeparateUsd", declaredSeparateUsd); // 20
  console.log("declaredTotalUsd", declaredTotalUsd);       // ≒ 26.24
    console.log("shippingSafetyMarkupUsd", shippingSafetyMarkupUsd);

  return {
    customsShippingUsd: shippingUsd,   // 実送料USD
    baseUsd: declaredTotalUsd,         // 申告額（合計）
    dutyUsd,
    disbursementJpy,
    mpfJpy,
    customsFeeJpy,
    shippingSafetyMarkupUsd,
    declaredSeparateUsd,
    declaredTotalUsd,
  };
}
