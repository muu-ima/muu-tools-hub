// lib/profit-calc-us/types.ts

// 原産国レート（public/data/origin.json）
export type OriginRate = {
  name: string; // "China" など
  rate: number; // 0.30 など
};

// HTSコードレート（public/data/hts.json）
export type HtsItem = {
  code: string; // "8523" など
  name: string; // "SSD" など
  rate: number; // 0.00 など
};

// 送料バンド
export type ShippingBandUS = {
  minChargeUsd: number;
  maxChargeUsd: number;
  customsShippingUsd: number;
  policyId: number;
};

// 申告価格補正
export type DeclaredAdjustUS = {
  lowerLimitUsd: number;
  upperLimitUsd: number;
  lowerAdjustUsd: number;
  upperAdjustUsd: number;
};

// 関税計算の入力
export type DutyCalcParamsUS = {
  sellingUsd: number;
  domesticShippingJpy: number;
  bankFx: number;
  originRate: number;
  itemRate: number;
};

// 関税計算の結果
export type DutyCalcResultUS = {
  customsShippingUsd: number;
  baseUsd: number;
  dutyUsd: number;
  disbursementJpy: number;
  mpfJpy: number;
  customsFeeJpy: number;
  shippingSafetyMarkupUsd: number; // 送料の上乗せ担保額（Shipping Policy バンド）
  declaredSeparateUsd: number;     // 送料別の申告額（J15 相当）
  declaredTotalUsd: number;        // 合計申告額（J16 相当）
};

// 関税込み最終利益
export type FinalWithDutyUS = {
  baseProfitJPY: number;
  customsFeeJpy: number;
  finalProfitJPY: number;
  profitDiffJPY: number;
};
