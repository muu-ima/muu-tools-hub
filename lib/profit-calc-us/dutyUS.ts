import type { DutyCalcParamsUS, DutyCalcResultUS } from "./types";

// Q14:Q20 の Shipping Policy バンド（シートと同じ）
const SHIPPING_POLICY_BANDS_USD = [7, 15, 30, 55, 80, 110, 180] as const;

// 小さなユーティリティ（USDは小数2桁、JPYは整数）
const usd = (v: number) => Number(v.toFixed(2));
const jpy0 = (v: number) => Math.round(v);

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
 * スプレッドシート右側「関税計算」をまる写し版（丸め位置も合わせる）
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

  // --- V22: 送料USD（シートでは 2 桁で丸めてから後続計算に使う）---
  const shippingUsd = usd(domesticShippingJpy / bankFx); // V22

  // --- W22: 販売額 + 送料（USD）---
  const baseForPercentUsd = usd(sellingUsd + shippingUsd); // W22

  const dutyRate = originRate + itemRate; // I11+K11

  // --- K12: 仮の関税額 ---
  const provisionalDutyUsd = usd(baseForPercentUsd * dutyRate); // K12

  // --- M15: Policy による安全マージン（80ドルとか）---
  const shippingSafetyMarkupUsd = pickShippingPolicyBand(provisionalDutyUsd); // M15

  // ★ indexOf 用に "number" → 正しい BAND 型にキャスト
  const policyId = SHIPPING_POLICY_BANDS_USD.indexOf(
    shippingSafetyMarkupUsd as (typeof SHIPPING_POLICY_BANDS_USD)[number],
  );

  // --- J15: 申告用の「販売額」（売値 - Policy分）---
  const declaredSeparateUsd = usd(sellingUsd - shippingSafetyMarkupUsd); // J15

  // --- J16: 申告価格 合計（販売額 + 送料）---
  const declaredTotalUsd = usd(declaredSeparateUsd + shippingUsd); // J16

  // --- J17: 関税額（USD）---
  const dutyUsd = usd(declaredTotalUsd * dutyRate); // J17

  // --- Y26: 関税額（円）---
  const customsFeeJpy = jpy0(dutyUsd * bankFx);

  // --- MPF（USD固定 2.62）→ 円 ---
  const MPF_USD = 2.62;
  const mpfJpy = jpy0(MPF_USD * bankFx);

  // --- V26/V27/V28: Disbursement ---
  const FLAT_DISB_USD = 15; // ← 4.5 → 15 に変更
  const flatDisbJpy = jpy0(FLAT_DISB_USD * bankFx); // V26
  const percentDisbJpy = jpy0(baseForPercentUsd * 0.02 * bankFx); // V27
  const disbursementJpy = Math.max(flatDisbJpy, percentDisbJpy); // V28

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
    policyId,
  };
}
