// lib/profit-calc-us/shippingPolicyBands.ts

import type { ShippingBandUS, DeclaredAdjustUS } from "./types";

// ここはシートの行を見ながら埋めていく
export const SHIPPING_BANDS_US: ShippingBandUS[] = [
  // 例：配送料が 0〜10 ドルなら 関税用送料は 7ドル / ポリシーID=7
  { minChargeUsd: 0,   maxChargeUsd: 10,  customsShippingUsd: 7,   policyId: 7 },
  // 例：10〜20 ドルなら 15ドル / ポリシーID=15
  { minChargeUsd: 10,  maxChargeUsd: 20,  customsShippingUsd: 15,  policyId: 15 },
  { minChargeUsd: 20,  maxChargeUsd: 40,  customsShippingUsd: 30,  policyId: 30 },
  { minChargeUsd: 40,  maxChargeUsd: 60,  customsShippingUsd: 55,  policyId: 55 },
  { minChargeUsd: 60,  maxChargeUsd: 90,  customsShippingUsd: 80,  policyId: 80 },
  { minChargeUsd: 90,  maxChargeUsd: 120, customsShippingUsd: 110, policyId: 110 },
  { minChargeUsd: 120, maxChargeUsd: 9999, customsShippingUsd: 180, policyId: 180 },
];


export const DECLARED_ADJUST_US: DeclaredAdjustUS = {
  lowerLimitUsd: 110,    // 「以下 $110.00」
  upperLimitUsd: 180,    // 「以上 $180.00」
  lowerAdjustUsd: -8.02, // 「以下」の行の -8.02
  upperAdjustUsd: 8.02,  // 「以上」の行の +8.02
};
