"use client";

import React from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
} from "@/features/products/constans";
import type { CategorySlug } from "@/features/products/constans";
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
    setField, // ← hook 側で返している前提
  } = useProductForm({
    initial,
    defaultSheetKey,
    onSubmit,
  });

  const isDisabled = disabled || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* シート切り替えタブ */}
      <div className="inline-flex rounded-xl border p-1 bg-white">
        {SHEETS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSheetKey(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              sheetKey === s.key
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={isDisabled}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 商品名 */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm text-gray-600">商品名（title）</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.title}
            onChange={onTextChange("title")}
            placeholder="例：Tシャツ"
            required
            disabled={isDisabled}
          />
        </label>

        {/* 商品カテゴリ */}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm text-gray-600">商品カテゴリ</span>
          <select
            className="rounded-md border px-3 py-2"
            value={form.child_category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setField(
                "child_category",
                e.target.value as CategorySlug | ""
              )
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

        {/* 実送料 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">実送料（円）</span>
          <input
            className="rounded-md border px-3 py-2"
            inputMode="decimal"
            value={form.shipping_actual_yen}
            onChange={onNumberChange("shipping_actual_yen")}
            placeholder="例：980"
            disabled={isDisabled}
          />
        </label>

        {/* 寸法 */}
        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">縦（cm）</span>
            <input
              className="rounded-md border px-3 py-2"
              inputMode="decimal"
              value={form.height_cm}
              onChange={onNumberChange("height_cm")}
              placeholder="例：10"
              disabled={isDisabled}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">横（cm）</span>
            <input
              className="rounded-md border px-3 py-2"
              inputMode="decimal"
              value={form.length_cm}
              onChange={onNumberChange("length_cm")}
              placeholder="例：30"
              disabled={isDisabled}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">幅（cm）</span>
            <input
              className="rounded-md border px-3 py-2"
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
          <span className="text-sm text-gray-600">実際の重さ (g)</span>
          <input
            className="rounded-md border px-3 py-2"
            inputMode="decimal"
            required
            value={form.weight_g}
            onChange={onNumberChange("weight_g")}
            placeholder="例：350"
            disabled={isDisabled}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">適用容量 (g)</span>
          <input
            className="rounded-md border px-3 py-2 bg-gray-50"
            readOnly
            value={form.applied_weight_g}
            placeholder="長さ×幅×高さ÷5 で自動計算"
          />
        </label>

        {/* 配送業者 */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">配送業者（carrier）</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.carrier}
            onChange={onTextChange("carrier")}
            placeholder="例：EMS / ePacket / FedEx"
            disabled={isDisabled}
          />
        </label>

        {/* Amazon サイズラベル */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">
            Amazon サイズラベル
          </span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.amazon_size_label}
            onChange={onTextChange("amazon_size_label")}
            placeholder="例：SmallStandard"
            disabled={isDisabled}
          />
        </label>
      </div>

      {/* ボタン */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isDisabled}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isDisabled}
          >
            キャンセル
          </button>
        )}
      </div>

      <LoadingOverlay show={submitting} message="保存中です…" />
    </form>
  );
}
