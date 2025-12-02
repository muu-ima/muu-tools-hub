// app/features/products/productTypes.ts
import type { CategorySlug } from "@/features/products/constans";

export const SHEETS = [
  { key: "keln", label: "ケルン用", id: 3 },
  { key: "cocconiel", label: "コッコニール用", id: 4 },
  { key: "signpost", label: "サインポスト用", id: 5 },
] as const;

export type SheetKey = (typeof SHEETS)[number]["key"];

export type NumericKeys =
  | "shipping_actual_yen"
  | "length_cm"
  | "width_cm"
  | "height_cm"
  | "weight_g"
  | "applied_weight_g";

export type FormState = {
  title: string;
  shipping_actual_yen: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  weight_g: string;
  applied_weight_g: string;
  carrier: string;
  amazon_size_label: string;
  child_category: CategorySlug | "";
};

export type SubmitPayload = {
  title: string;
  shipping_actual_yen: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  weight_g: number | null;
  applied_weight_g: number | null;
  carrier: string;
  amazon_size_label: string;
  child_category: CategorySlug; // 送信時点では必ず選択済みの前提
  product_sheet: number[];
  secret: string;
};

export type WPProductMeta = {
  product_category?: CategorySlug;
  child_category?: CategorySlug;
  // ほかの meta があれば追加
};

export type ProductInitial = {
  title?: string;
  shipping_actual_yen?: number | string | null;
  length_cm?: number | string | null;
  width_cm?: number | string | null;
  height_cm?: number | string | null;
  weight_g?: number | string | null;
  applied_weight_g?: number | string | null;
  carrier?: string | null;
  amazon_size_label?: string | null;
  meta?: WPProductMeta;
};
