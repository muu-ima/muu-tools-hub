"use client";

import React from "react";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/features/products/constants";
import type { CategorySlug } from "@/features/products/constants";
import LoadingOverlay from "./LoadingOverlay";

import {
  SHEETS,
  type SheetKey,
  type SubmitPayload,
  type ProductInitial,
} from "@/features/products/productTypes";
import { useProductForm } from "@/features/products/hooks/useProductForm";

type Props = {
  initial?: ProductInitial;
  submitLabel?: string;
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
  onCancel?: () => void;
  disabled?: boolean;
  defaultSheetKey?: SheetKey;
};

export default function ProductForm({
  initial,
  submitLabel = "保存",
  onSubmit,
  onCancel,
  disabled,
  defaultSheetKey = "keln",
}: Props) {
  const {
    form,
    onTextChange,
    onNumberChange,
    sheetKey,
    setSheetKey,
    submitting,
    handleSubmit,
    setField,
  } = useProductForm({
    initial,
    defaultSheetKey,
    onSubmit,
  });

  const isDisabled = disabled || submitting;
  const currentSheet = SHEETS.find((s) => s.key === sheetKey);

  // 共通の input クラス（フォーカス時のリングとか）
  const inputClass =
    "rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm shadow-sm " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-300 " +
    "placeholder:text-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-black/5"
    >
      {/* ヘッダーバー */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-rose-100 bg-linear-to-r from-rose-50/80 via-amber-50/80 to-sky-50/80 px-4 py-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">
            発送情報フォーム
          </p>
          <p className="text-xs text-gray-600">
            発送情報を登録します。あとから編集も可能です。
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-3 py-1 text-[11px] text-gray-600 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium">
            現在のシート：{currentSheet?.label ?? "—"}
          </span>
        </div>
      </div>

      {/* シート切り替えタブ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50/80 p-1 shadow-inner">
          {SHEETS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSheetKey(s.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                sheetKey === s.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
              disabled={isDisabled}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* フォーム本体 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* セクション見出し：基本情報 */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="h-1px w-6 bg-rose-300" />
            基本情報
          </div>
        </div>

        {/* 商品名 */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-gray-600">
            商品名（title）
          </span>
          <input
            className={inputClass}
            value={form.title}
            onChange={onTextChange("title")}
            placeholder="例：Tシャツ"
            required
            disabled={isDisabled}
          />
        </label>

        {/* 商品カテゴリ */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-gray-600">
            商品カテゴリ
          </span>
          <select
            className={inputClass}
            value={form.child_category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setField("child_category", e.target.value as CategorySlug | "")
            }
            required
            disabled={isDisabled}
          >
            <option value="">選択してください</option>
            {CATEGORY_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {CATEGORY_LABELS[slug]}
              </option>
            ))}
          </select>
        </label>

        {/* セクション見出し：送料・サイズ */}
        <div className="sm:col-span-2">
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="h-1px w-6 bg-sky-300" />
            送料・サイズ
          </div>
        </div>

        {/* 実送料 */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-gray-600">
            実送料（円）
          </span>
          <input
            className={inputClass}
            inputMode="decimal"
            value={form.shipping_actual_yen}
            onChange={onNumberChange("shipping_actual_yen")}
            placeholder="例：980"
            disabled={isDisabled}
          />
          <span className="mt-0.5 text-[10px] text-gray-400">
            実際に支払った送料（円建て）
          </span>
        </label>

        {/* 寸法 */}
        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">縦（cm）</span>
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.height_cm}
              onChange={onNumberChange("height_cm")}
              placeholder="例：10"
              disabled={isDisabled}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">横（cm）</span>
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.length_cm}
              onChange={onNumberChange("length_cm")}
              placeholder="例：30"
              disabled={isDisabled}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">幅（cm）</span>
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.width_cm}
              onChange={onNumberChange("width_cm")}
              placeholder="例：20"
              disabled={isDisabled}
            />
          </label>
        </div>

        {/* 実重量・適用容量 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">
            実際の重さ (g)
          </span>
          <input
            className={inputClass}
            inputMode="decimal"
            required
            value={form.weight_g}
            onChange={onNumberChange("weight_g")}
            placeholder="例：350"
            disabled={isDisabled}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">
            適用容量 (g)
          </span>
          <input
            className={`${inputClass} bg-gray-50 border-dashed`}
            readOnly
            value={form.applied_weight_g}
            placeholder="長さ×幅×高さ÷5 で自動計算"
          />
          <span className="mt-0.5 text-[10px] text-gray-400">
            実重量と比較して重い方が送料計算に使われます
          </span>
        </label>

        {/* セクション見出し：ラベル */}
        <div className="sm:col-span-2">
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700">
            <span className="h-1px w-6 bg-emerald-300" />
            ラベル・メモ
          </div>
        </div>

        {/* 配送業者 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">
            配送業者（carrier）
          </span>
          <input
            className={inputClass}
            value={form.carrier}
            onChange={onTextChange("carrier")}
            placeholder="例：EMS / ePacket / FedEx"
            disabled={isDisabled}
          />
        </label>

        {/* Amazon サイズラベル */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">
            Amazon サイズラベル
          </span>
          <input
            className={inputClass}
            value={form.amazon_size_label}
            onChange={onTextChange("amazon_size_label")}
            placeholder="例：SmallStandard"
            disabled={isDisabled}
          />
        </label>
      </div>

      {/* ボタン */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isDisabled}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isDisabled}
        >
          {submitLabel}
        </button>
      </div>

      <LoadingOverlay show={submitting} message="保存中です…" />
    </form>
  );
}
