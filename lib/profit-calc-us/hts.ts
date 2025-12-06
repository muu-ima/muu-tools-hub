// lib/profit-calc-us/hts.ts

import htsData from "@/public/data/hts.json";
import type { HtsItem } from "./types";

const HTS_ITEMS = htsData as HtsItem[];

/**
 * HTS 一覧（セレクト表示用）
 */
export function listHtsOptions(): HtsItem[] {
  return HTS_ITEMS;
}

/**
 * コードから HTS レートを取得（なければ null）
 */
export function getHtsRateByCode(code: string): number | null {
  const hit = HTS_ITEMS.find((item) => item.code === code);
  return hit ? hit.rate : null;
}

/**
 * name（SSD / タオル…）から HTS 項目を取得
 */
export function getHtsByName(name: string): HtsItem | null {
  const hit = HTS_ITEMS.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );
  return hit ?? null;
}

/**
 * インデックス選択用ヘルパー
 */
export function getHtsRateByIndex(index: number): number | null {
  const hit = HTS_ITEMS[index];
  return hit ? hit.rate : null;
}
