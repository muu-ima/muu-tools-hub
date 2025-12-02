// src/features/products/api.ts
import type { SearchResponse } from "@/features/products/types";

export type ProductsApiParams = Record<
  string,
  string | string[] | undefined
>;

export async function getProducts(
  params: ProductsApiParams
): Promise<SearchResponse> {
  const p = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((vv) => p.append(k, vv));
    } else if (v !== undefined && v !== "") {
      p.set(k, v);
    }
  });

  if (!p.has("per_page")) p.set("per_page", "50");
  if (!p.has("page")) p.set("page", "1");

  const res = await fetch(`/api/products?${p.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  return res.json();
}
