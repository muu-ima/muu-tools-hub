// lib/profit-calc-us/shippingPolicyBands.ts
import type { ShippingBandUS } from "./types";

/** スプレッドシート T14〜V20 完全一致 */
export const SHIPPING_BANDS_US: ShippingBandUS[] = [
  { minChargeUsd: 0,   maxChargeUsd: 7,    customsShippingUsd: 7,   policyId: 7 },
  { minChargeUsd: 7,   maxChargeUsd: 15,   customsShippingUsd: 15,  policyId: 15 },
  { minChargeUsd: 15,  maxChargeUsd: 30,   customsShippingUsd: 30,  policyId: 30 },
  { minChargeUsd: 30,  maxChargeUsd: 55,   customsShippingUsd: 55,  policyId: 55 },
  { minChargeUsd: 55,  maxChargeUsd: 80,   customsShippingUsd: 80,  policyId: 80 },
  { minChargeUsd: 80,  maxChargeUsd: 110,  customsShippingUsd: 110, policyId: 110 },
  { minChargeUsd: 110, maxChargeUsd: 9999, customsShippingUsd: 180, policyId: 180 },
];
