// lib/profit-calc-us/origin.ts

import originData from "@/public/data/origin.json";
import type { OriginRate } from "./types";

// JSON を型付きの配列に
const ORIGIN_RATES = originData as OriginRate[];

/**
 * 原産国一覧（セレクト表示用）
 */
export function listOriginOptions(): OriginRate[] {
  return ORIGIN_RATES;
}

/**
 * 国名から関税率を取得（なければ null）
 */
export function getOriginRateByName(name: string): number | null {
  const hit = ORIGIN_RATES.find(
    (o) => o.name.toLowerCase() === name.toLowerCase()
  );
  return hit ? hit.rate : null;
}

/**
 * index（0,1,2…）で選択している場合用のヘルパー
 */
export function getOriginRateByIndex(index: number): number | null {
  const hit = ORIGIN_RATES[index];
  return hit ? hit.rate : null;
}
