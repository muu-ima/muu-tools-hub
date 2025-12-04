import { useState } from "react";
import type { CategorySlug } from "@/features/products/constants";
import {
  type FormState,
  type ProductInitial,
  type SheetKey,
  type SubmitPayload,
  SHEETS,
  type NumericKeys,
} from "@/features/products/productTypes";
import { normalizeNumericInput, toNumOrNull } from "@/features/products/utils";
import { useAppliedWeight } from "@/features/products/hooks/useAppliedWeight";

type UseProductFormOptions = {
  initial?: ProductInitial;
  defaultSheetKey?: SheetKey;
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
};

export function useProductForm({
  initial,
  defaultSheetKey = "keln",
  onSubmit,
}: UseProductFormOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [sheetKey, setSheetKey] = useState<SheetKey>(defaultSheetKey);

  const [form, setForm] = useState<FormState>(() => ({
    title: initial?.title ?? "",
    shipping_actual_yen:
      initial?.shipping_actual_yen != null
        ? String(initial.shipping_actual_yen)
        : "",
    length_cm: initial?.length_cm != null ? String(initial.length_cm) : "",
    width_cm: initial?.width_cm != null ? String(initial.width_cm) : "",
    height_cm: initial?.height_cm != null ? String(initial.height_cm) : "",
    weight_g: initial?.weight_g != null ? String(initial.weight_g) : "",
    applied_weight_g:
      initial?.applied_weight_g != null ? String(initial.applied_weight_g) : "",
    carrier: initial?.carrier ?? "",
    amazon_size_label: initial?.amazon_size_label ?? "",
    child_category:
      (initial?.meta?.product_category as CategorySlug | undefined) ??
      (initial?.meta?.child_category as CategorySlug | undefined) ??
      "",
  }));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ---- Text input handler ----
  const onTextChange =
    <K extends Exclude<keyof FormState, NumericKeys>>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setField(key, e.target.value);
    };

  // ---- Numeric input handler ----
  const onNumberChange =
    (key: NumericKeys) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setField(key, normalizeNumericInput(e.target.value));
    };

  // ---- applied_weight_g の自動計算 ----
  useAppliedWeight({
    length_cm: form.length_cm,
    width_cm: form.width_cm,
    height_cm: form.height_cm,
    setValue: (v) => setField("applied_weight_g", v),
  });

  // ---- form submission ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // ★ ここで「いま選ばれている sheetKey から」毎回取り直す
      const sheet = SHEETS.find((s) => s.key === sheetKey);
      const sheetId = sheet ? sheet.id : SHEETS[0].id;

      const payload: SubmitPayload = {
        title: form.title.trim(),
        shipping_actual_yen: toNumOrNull(form.shipping_actual_yen),
        length_cm: toNumOrNull(form.length_cm),
        width_cm: toNumOrNull(form.width_cm),
        height_cm: toNumOrNull(form.height_cm),
        weight_g: toNumOrNull(form.weight_g),
        applied_weight_g: toNumOrNull(form.applied_weight_g),
        carrier: form.carrier.trim(),
        amazon_size_label: form.amazon_size_label.trim(),
        child_category: form.child_category,
        product_sheet: [sheetId],
        secret: process.env.NEXT_PUBLIC_FORM_SECRET!,
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setField,
    onTextChange,
    onNumberChange,
    sheetKey,
    setSheetKey,
    submitting,
    handleSubmit,
  };
}
