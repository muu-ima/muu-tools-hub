// lib/profit-calc-us/shippingBandsUS.ts

import { SHIPPING_BANDS_US } from "@/lib/profit-calc-us/shippingPolicyBands";
import type { ShippingBandUS } from "./types";

/**
 * バイヤーに請求している送料(USD)から
 * スプレッドシートの「関税用送料 / ポリシー」を選ぶ
 */
export function selectShippingBandUS(
  chargedShippingUsd: number
): ShippingBandUS | null {
  return (
    SHIPPING_BANDS_US.find(
      (band) =>
        chargedShippingUsd >= band.minChargeUsd &&
        chargedShippingUsd < band.maxChargeUsd
    ) ?? null
  );
}
