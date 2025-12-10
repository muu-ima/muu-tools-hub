"use client";

import Link from "next/link";
import Sidebar from "@/app/tools/shipping-manager/components/Sidebar";
import LoadingOverlay from "@/app/tools/shipping-manager/components/LoadingOverlay";
import DraggableScroll from "@/app/tools/shipping-manager/components/DraggableScroll";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  CATEGORY_LABELS,
  type CategorySlug,
} from "@/features/products/constants";

import type {
  SearchQuery,
  SearchItem,
  SearchResponse,
} from "@/features/products/types";

import { SHEETS } from "@/features/products/productTypes";
import type { SheetKey } from "@/features/products/productTypes";

import { normalizeMeta, fmtNum, fmtTxt } from "@/features/products/utils";
import { getProducts } from "@/features/products/api";

/* ===== クライアント本体 ===== */
export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL → SearchQuery に整形（useMemoで安定化）
  const sp: SearchQuery = useMemo(() => {
    const get = (k: string) => {
      const v = searchParams.get(k);
      // ★ 空文字や空白だけのときは undefined 扱いにする
      return v && v.trim() !== "" ? v : undefined;
    };
    const getAll = (k: string) => {
      const arr = searchParams.getAll(k);
      return arr.length ? arr : undefined;
    };

    return {
      sheet: get("sheet"),
      child_category: getAll("child_category"),
      id: get("id"),
      q: get("q"),
      shipping_actual_yen_max: get("shipping_actual_yen_max"),
      weight_g_max: get("weight_g_max"),
      applied_weight_g_max: get("applied_weight_g_max"),
      carrier: get("carrier"),
      amazon_size_label: get("amazon_size_label"),
      page: get("page"),
      per_page: get("per_page"),
    };
  }, [searchParams]);

  // 依存比較用キー（URLの実体を使うのが定番）
  const spKey = useMemo(() => searchParams.toString(), [searchParams]);

  const sheet = (sp.sheet as SheetKey) ?? "keln";
  const sheetDef = SHEETS.find((s) => s.key === sheet)!;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [meta, setMeta] = useState<SearchResponse["meta"]>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiParams = {
          sheet: sheetDef.key,
          child_category: sp.child_category,
          id: sp.id,
          q: sp.q,
          shipping_actual_yen_max: sp.shipping_actual_yen_max,
          weight_g_max: sp.weight_g_max,
          applied_weight_g_max: sp.applied_weight_g_max,
          carrier: sp.carrier,
          amazon_size_label: sp.amazon_size_label,
          page: sp.page,
          per_page: sp.per_page ?? "15",
        } as const;

        const { data, meta: apiMeta } = await getProducts(apiParams);

        // ★ meta をフロント用の形に正規化
        const normalizedMeta: SearchResponse["meta"] | undefined = apiMeta
          ? {
              total: apiMeta.total ?? 0,
              pages:
                // どっちか入っているほうを採用
                (apiMeta as { pages?: number; total_pages?: number }).pages ??
                (apiMeta as { pages?: number; total_pages?: number })
                  .total_pages ??
                1,
              page: apiMeta.page ?? 1,
              perPage:
                (apiMeta as { perPage?: number; per_page?: number }).perPage ??
                (apiMeta as { perPage?: number; per_page?: number }).per_page ??
                15,
            }
          : undefined;

        setItems(data ?? []);
        setMeta(normalizedMeta);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sheetDef.id, spKey]);

  console.log("meta from API", meta);

  const pages = meta?.pages ?? 1;

  const perPageParam = meta?.perPage?.toString() ?? sp.per_page ?? "15";

  return (
    <main className="h-screen flex flex-row">
      <Sidebar sp={sp} sheet={sheet} SHEETS={SHEETS} />

      <section className="flex-1 flex flex-col p-6 overflow-hidden w-full max-w-none">
        {/* 件数 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">発送商品一覧</h1>
          <div className="text-sm text-gray-600">
            {meta ? (
              <>
                該当 <b>{meta.total}</b> 件
              </>
            ) : null}
          </div>
        </div>

        {/* テーブル */}
        <div className="flex-1 overflow-auto rounded-xl border bg-white/70 shadow-sm backdrop-blur">
          <DraggableScroll>
            <table className="table-fixed w-full text-sm border-collapse">
              {/* colgroup などは元のまま */}
              <colgroup>
                <col className="w-[72px]" />
                <col className="w-[420px]" />
                <col className="w-[120px]" />
                <col className="w-[88px]" />
                <col className="w-[88px]" />
                <col className="w-[88px]" />
                <col className="w-[120px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
                <col className="w-[120px]" />
              </colgroup>

              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr className="text-left border-b">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">商品名</th>
                  <th className="py-2 px-3 text-right">送料 (円)</th>
                  <th className="py-2 px-3 text-right">縦 (cm)</th>
                  <th className="py-2 px-3 text-right">横 (cm)</th>
                  <th className="py-2 px-3 text-right">幅 (cm)</th>
                  <th className="py-2 px-3 text-right">実重量 (g)</th>
                  <th className="py-2 px-3 text-right">適用容量 (g)</th>
                  <th className="py-2 px-3">配送業者</th>
                  <th className="py-2 px-3">サイズラベル</th>
                  <th className="py-2 px-3">カテゴリ</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  items.map((p) => {
                    const title =
                      (typeof p.title === "string"
                        ? p.title
                        : p.title?.rendered) ?? "-";

                    const m = normalizeMeta(p);

                    const metaCat =
                      (typeof p.meta?.product_category === "string" &&
                        p.meta?.product_category) ||
                      (typeof p.meta?.child_category === "string" &&
                        p.meta?.child_category) ||
                      "";

                    const legacyTop = Array.isArray(p.child_category)
                      ? p.child_category[0] ?? ""
                      : typeof p.child_category === "string"
                      ? p.child_category
                      : "";

                    const categorySlug = (metaCat || legacyTop) as
                      | ""
                      | CategorySlug;
                    const categoryLabel = categorySlug
                      ? CATEGORY_LABELS[categorySlug] ?? categorySlug
                      : "-";

                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{p.id}</td>
                        <td className="py-2 px-3">{title}</td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          {fmtNum(m.shipping_actual_yen)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {fmtNum(m.height_cm)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {fmtNum(m.length_cm)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {fmtNum(m.width_cm)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          {fmtNum(m.weight_g)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          {fmtNum(m.applied_weight_g)}
                        </td>
                        <td className="py-2 px-3">{fmtTxt(m.carrier)}</td>
                        <td className="py-2 px-3">
                          {fmtTxt(m.amazon_size_label)}
                        </td>
                        <td className="py-2 px-3">{categoryLabel}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </DraggableScroll>
        </div>

        {/* ページネーション（…省略付き） */}
        {/* ページネーション（…省略付き） */}
        {meta && pages > 1 && (
          <nav
            className="flex items-center justify-center gap-2 mt-4"
            aria-label="ページネーション"
          >
            {/* 前へ */}
            {meta.page > 1 && (
              <Link
                href={{
                  pathname, // ← 今いるパスをそのまま使う
                  query: {
                    ...sp,
                    page: String(meta.page - 1),
                    per_page: perPageParam,
                  },
                }}
                prefetch={false}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                前へ
              </Link>
            )}

            {/* ページ番号（…省略） */}
            {Array.from({ length: pages }).map((_, i) => {
              const pageNum = i + 1;

              if (
                pageNum === 1 ||
                pageNum === pages ||
                Math.abs(pageNum - meta.page) <= 2
              ) {
                return (
                  <Link
                    key={pageNum}
                    href={{
                      pathname,
                      query: {
                        ...sp,
                        page: String(pageNum),
                        per_page: perPageParam,
                      },
                    }}
                    prefetch={false}
                    className={`px-3 py-1 border rounded ${
                      meta.page === pageNum
                        ? "bg-black text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              }

              if (
                (pageNum === 2 && meta.page > 4) ||
                (pageNum === pages - 1 && meta.page < pages - 3)
              ) {
                return (
                  <span key={pageNum} className="px-2">
                    …
                  </span>
                );
              }

              return null;
            })}

            {/* 次へ */}
            {meta.page < pages && (
              <Link
                href={{
                  pathname,
                  query: {
                    ...sp,
                    page: String(meta.page + 1),
                    per_page: perPageParam,
                  },
                }}
                prefetch={false}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                次へ
              </Link>
            )}
          </nav>
        )}
      </section>

      {/* 全画面ローダー */}
      <LoadingOverlay show={loading} message="読み込み中です…" />
    </main>
  );
}
