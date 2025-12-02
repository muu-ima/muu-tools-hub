// app/features/products/types.ts
import type { WPProduct } from "@/types/wp";
import type { CategorySlug } from "@/features/products/constans";
    
export type ProductMeta = {
  shipping_actual_yen?: number | string;
  length_cm?: number | string;
  width_cm?: number | string;
  height_cm?: number | string;
  weight_g?: number | string;
  applied_weight_g?: number | string;
  carrier?: string;
  amazon_size_label?: string;
  product_category?: string;
  child_category?: string;
};

export type SearchQuery = {
  sheet?: string;
  child_category?: string | string[];
  id?: string;
  q?: string;
  shipping_actual_yen_max?: string;
  weight_g_max?: string;
  applied_weight_g_max?: string;
  carrier?: string;
  amazon_size_label?: string;
  page?: string;
  per_page?: string;
};

export type SearchItem = WPProduct & {
  title?: string | { rendered?: string };
  product_sheet?: Array<{ name: string; slug: string; term_id?: number }>;

  // raw from WP
  child_category?: string | string[];

  shipping_actual_yen?: number | string;
  length_cm?: number | string;
  width_cm?: number | string;
  height_cm?: number | string;
  weight_g?: number | string;
  applied_weight_g?: number | string;
  carrier?: string;
  amazon_size_label?: string;

  // メタはまとめてここに
  meta?: ProductMeta & {
    product_category?: CategorySlug | string;
    child_category?: CategorySlug | string;
  };
};


export type SearchResponse = {
  data: SearchItem[];
  meta?: { total: number; pages: number; page: number; perPage: number };
};