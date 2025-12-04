// app/tools/shipping-manager/forms/new/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductForm from "@/app/tools/shipping-manager/components/ProductForm";
import Modal from "@/app/tools/shipping-manager/components/Modal";
import { SheetKey } from "@/features/products/productTypes";

// ProductForm の props から onSubmit の引数型を逆算
type ProductFormProps = React.ComponentProps<typeof ProductForm>;
type SubmitPayload = Parameters<NonNullable<ProductFormProps["onSubmit"]>>[0];

// 例外メッセージを安全に文字列化
function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "不明なエラーが発生しました";
  }
}

// ★ ページ本体：ここで Suspense で包む
export default function SecretFormPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-6">
          <p className="text-sm text-neutral-500">フォームを準備中です…</p>
        </main>
      }
    >
      <SecretFormPageInner />
    </Suspense>
  );
}

function SecretFormPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLクエリから管理シートのスラッグを取得
  // （ケルンタブ→ ?sheet=keln, サインポストタブ→ ?sheet=signpost など）
  const sheetSlug = searchParams.get("sheet") ?? "keln";

  // ページ表示時にパスコード確認（localStorage）
  useEffect(() => {
    const pass = localStorage.getItem("form_pass");
    if (pass !== process.env.NEXT_PUBLIC_FORM_SECRET) {
      router.replace("/tools/shipping-manager/forms/entry");
    }
  }, [router]);

  // モーダル開閉 & 送信後の状態
  const [open, setOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // これを変えると ProductForm を再マウント=リセット

  // 実際の作成処理（API 叩く）
  const createProduct = async (values: SubmitPayload): Promise<void> => {
    setSubmitting(true);
    setDoneMsg(null);

    const payload = {
      ...values,
      // API側でも念のため確認したい場合に送る
      secret: process.env.NEXT_PUBLIC_FORM_SECRET!,
    };

    console.log("🚀 POST /api/products payload", payload);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("❌ /api/products error", res.status, text);
      throw new Error(`Failed to create product: ${res.status} ${text}`);
    }

    setDoneMsg("登録しました。");
  };

  // もう1件続けて入力：フォームを再マウントして値をクリア
  const handleAddAnother = () => {
    setDoneMsg(null);
    setFormKey((k) => k + 1);
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">
        発送情報入力フォーム（シークレット）
      </h1>

      {/* 今どのシートから開いてるかを一応表示（デバッグ兼ねて） */}
      <p className="mb-2 text-sm text-neutral-500">
        現在の管理シートスラッグ: {sheetSlug}
      </p>

      <button
        onClick={() => setOpen(true)}
        className="rounded bg-black px-4 py-2 text-sm text-white"
      >
        新規登録を開く
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="新規登録">
        {doneMsg ? (
          <div className="space-y-4">
            <p className="text-sm">{doneMsg}</p>
            <div className="flex gap-2">
              <button
                onClick={handleAddAnother}
                className="rounded bg-black px-3 py-2 text-sm text-white"
              >
                もう1件続けて入力
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.refresh(); // 一覧などを開いている場合の再取得
                }}
                className="rounded border px-3 py-2 text-sm"
              >
                閉じる
              </button>
              <button
                onClick={() => router.push("/tools/shipping-manager/")}
                className="rounded border px-3 py-2 text-sm"
              >
                一覧へ
              </button>
            </div>
          </div>
        ) : (
          <ProductForm
            key={formKey}
            defaultSheetKey={sheetSlug as SheetKey}
            submitLabel={submitting ? "送信中…" : "作成"}
            disabled={submitting}
            onSubmit={async (values) => {
              try {
                await createProduct(values);
              } catch (e: unknown) {
                alert(toErrorMessage(e));
              }
            }}
          />
        )}
      </Modal>
    </main>
  );
}
