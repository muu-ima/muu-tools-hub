// lib/profit-calc-us/hts.ts

import htsData from "@/public/data/hts.json";
import type { HtsItem } from "./types";

const HTS_ITEMS = htsData as HtsItem[];

/**
 * US版で DutyView から参照するためのそのままの一覧
 */
export const HTS_RATES_US: HtsItem[] = HTS_ITEMS;

/**
 * HTS 一覧（セレクト表示用）
 */
export function listHtsOptions(): HtsItem[] {
  return HTS_ITEMS;
}

/**
 * コードから HTS 項目を取得（DutyView 用）
 */
export function findHtsByCode(code: string): HtsItem | undefined {
  return HTS_ITEMS.find((item) => item.code === code);
}

/**
 * コードから HTS レートだけ取得（既存）
 */
export function getHtsRateByCode(code: string): number | null {
  const hit = HTS_ITEMS.find((item) => item.code === code);
  return hit ? hit.rate : null;
}

/**
 * 名前（SSD / タオル…）から HTS 項目を取得
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
