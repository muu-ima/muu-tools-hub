// lib/profit-calc-us/declaredValueUS.ts

import { selectShippingBandUS } from "@/lib/profit-calc-us/shippingBandsUS";
import type { ShippingBandUS } from "@/lib/profit-calc-us/types";

export type DeclaredValueUSParams = {
  /** 売値（USD）…シート B9 */
  sellingUsd: number;
  /** 国内送料（JPY）…シート D9（Fedex/EMS から来る） */
  domesticShippingJpy: number;
  /** 銀行レート（USD→JPY）…シート W10 */
  bankFx: number;
};

export type DeclaredValueUSResult = {
  /** 申告用に使う送料（USD）…J15「送料別」相当 */
  declaredShippingUsd: number;
  /** 実際に請求されている送料（USD）…J8/W10 相当 */
  chargedShippingUsd: number;
  /** 申告価格の合計（USD）…J16「合計」相当 */
  declaredValueUsd: number;
  /** 適用されたポリシーバンド（デバッグ用） */
  band: ShippingBandUS | null;
};

/**
 * スプレッドシートの J15〜M19 のロジックをまとめたヘルパー
 */
export function calcDeclaredValueUS(
  params: DeclaredValueUSParams
): DeclaredValueUSResult {
  const { sellingUsd, domesticShippingJpy, bankFx } = params;

  if (bankFx <= 0) {
    // 為替がまだ取れてないときは「売値だけ」を申告価格として返す
    return {
      declaredShippingUsd: 0,
      chargedShippingUsd: 0,
      declaredValueUsd: sellingUsd,
      band: null,
    };
  }

  // 実送料(USD) = 国内送料(JPY) / レート
  const chargedShippingUsd = domesticShippingJpy / bankFx;

  // どのポリシーバンドか（shippingBandsUS.ts 側に用意済み）
  const band = selectShippingBandUS(chargedShippingUsd);

// バンドの customsShippingUsd を申告用送料として使用
const declaredShippingUsd =
  band?.customsShippingUsd ?? chargedShippingUsd;

  // 申告価格の合計(J16) = 売値 + 申告用送料
  const declaredValueUsd = sellingUsd + declaredShippingUsd;

  return {
    declaredShippingUsd,
    chargedShippingUsd,
    declaredValueUsd,
    band: band ?? null,
  };
}
