// lib/profit-calc-us/declaredValueUS.ts

import { DECLARED_ADJUST_US } from "./shippingPolicyBands";

/**
 * 売値 + 関税用送料 から「申告価格(USD) = J16」を作る。
 * スプレッドシートの「設定ポリシー検索用」の ±8.02 を反映。
 */
export function calcDeclaredValueUS(params: {
  sellingUsd: number;
  customsShippingUsd: number;
}): number {
  const { sellingUsd, customsShippingUsd } = params;
  const base = sellingUsd + customsShippingUsd;

  const {
    lowerLimitUsd,
    upperLimitUsd,
    lowerAdjustUsd,
    upperAdjustUsd,
  } = DECLARED_ADJUST_US;

  if (sellingUsd <= lowerLimitUsd) {
    return base + lowerAdjustUsd; // 110以下 → -8.02
  }

  if (sellingUsd >= upperLimitUsd) {
    return base + upperAdjustUsd; // 180以上 → +8.02
  }

  // 中間帯は補正なし
  return base;
}
