// app/features/products/utils.ts
import type { ProductMeta, SearchItem } from "@/features/products/types";

export const fmtNum = (v: unknown) =>
  v == null || v === "" || v === 0 || v === "0"
    ? "-"
    : new Intl.NumberFormat("ja-JP").format(Number(v));

export const fmtTxt = (v: unknown) => (v == null || v === "" ? "-" : String(v));

export function normalizeMeta(p: SearchItem): ProductMeta {
  return {
    shipping_actual_yen: p.meta?.shipping_actual_yen ?? p.shipping_actual_yen,
    length_cm: p.meta?.length_cm ?? p.length_cm,
    width_cm: p.meta?.width_cm ?? p.width_cm,
    height_cm: p.meta?.height_cm ?? p.height_cm,
    weight_g: p.meta?.weight_g ?? p.weight_g,
    applied_weight_g: p.meta?.applied_weight_g ?? p.applied_weight_g,
    carrier: p.meta?.carrier ?? p.carrier,
    amazon_size_label: p.meta?.amazon_size_label ?? p.amazon_size_label,
  };
}

/** 空 or 非数なら null */
export function toNumOrNull(s: string): number | null {
  const t = (s ?? "").toString().trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** 数値入力の正規化（全角→半角、余計な文字削除、マイナス1つ、小数点1つ） */
export function normalizeNumericInput(s: string): string {
  let t = (s ?? "").toString().replace(/^\s+|\s+$/g, "");
  // 全角 → 半角
  t = t.replace(/[０-９．－]/g, (ch) =>
    "０１２３４５６７８９．－".includes(ch)
      ? "0123456789.-"["０１２３４５６７８９．－".indexOf(ch)]
      : ch
  );
  // 不正な文字を除外
  t = t.replace(/[^0-9.\-]/g, "");
  // マイナスは先頭だけ
  if (t.includes("-")) {
    t = (t.startsWith("-") ? "-" : "") + t.replace(/-/g, "").replace(/^-/, "");
  }
  // 小数点も1つだけ
  const i = t.indexOf(".");
  if (i >= 0) t = t.slice(0, i + 1) + t.slice(i + 1).replace(/\./g, "");
  return t;
}
