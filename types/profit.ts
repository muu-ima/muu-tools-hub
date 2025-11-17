// /types/profit.ts

export type ShippingResult = {
  method: string;
  price: number | null;
};

export type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

// ▼ 配送モード
export type ShippingMode = "auto" | "manual";

// ▼ 通貨
export type Currency = "GBP" | "USD";

// ▼ 最終利益の詳細（モーダルで使うやつ）
export type FinalProfitDetail = {
  costPriceJPY: number;
  sellingPriceJPY: number;
  sellingPriceGBP: number; // 元値
  adjustedPriceGBP: number;
  categoryFeeGBP: number;
  customsFeeGBP: number;
  payoneerFeeGBP: number;
  totalFeesGBP: number;
  netSellingGBP: number;
  exchangeFeeJPY: number;
  netSellingJPY: number;
  vatAmountGBP: number;
  vatAmountJPY: number;
  importVATGBP?: number;
  importVATJPY?: number;
  vatToPayGBP?: number;
  vatToPayJPY?: number;
  netProfitJPY: number;
  finalProfitJPY: number;
  exchangeAdjustmentJPY: number;
  feeRebateJPY: number;
  profitMargin: number;
};
// ▼ FinalResult 系コンポーネントの基本 props（モーダル・カード共通で使えるやつ）
export type FinalResultBaseProps = {
  shippingMethod: string;
  shippingJPY: number;
  data: FinalProfitDetail;
  exchangeRateGBPtoJPY: number;
};