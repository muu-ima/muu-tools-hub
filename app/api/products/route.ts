// app/api/products/route.ts
import { wpFetch } from "@/lib/wp";

// ===== 型定義 =====
type WPProductMeta = {
  product_category?: string;
  child_category?: string;
  [k: string]: unknown;
};

type WPProduct = {
  id?: number;
  meta?: WPProductMeta;
  [k: string]: unknown;
};

type SearchResponse = {
  data?: WPProduct[];
  [k: string]: unknown;
};

type IncomingProductBody = {
  title?: string;
  name?: string;
  cost?: number | string | null;
  length_cm?: number | string | null;
  width_cm?: number | string | null;
  height_cm?: number | string | null;
  weight_g?: number | string | null;
  applied_weight_g?: number | string | null;
  shipping_actual_yen?: number | string | null;
  carrier?: string | null;
  amazon_size_label?: string | null;
  product_sheet?: unknown;
  product_category?: string | null;
  child_category?: string | null;

  // どの管理シートから開いたか（forms/new が付けてくる）
  sheet_slug?: string | null;
};

// ===== 共通 helper =====
const num = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const text = (v: unknown): string => (v == null ? "" : String(v));

// =======================
// GET: 一覧・検索
// =======================
export async function GET(request: Request) {
  const url = new URL(request.url);

  // いったん全部拾う（空文字は除外）
  const params = new URLSearchParams();
  url.searchParams.forEach((v, k) => {
    if (v !== "") params.append(k, v);
  });

  // --- sheet → product_sheet に変換（管理シートのスラッグ） ---
  const sheet = url.searchParams.get("sheet");
  if (sheet) {
    params.set("product_sheet", sheet);
    params.delete("sheet");
  }

  // --- 互換: child_category → product_category（配列/CSV両対応） ---
  const childArr = url.searchParams.getAll("child_category");
  const childCsv = url.searchParams.get("child_category");
  const cats: string[] = [];

  if (childArr.length) cats.push(...childArr);
  if (childCsv) {
    cats.push(
      ...childCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }

  if (cats.length) {
    params.set("product_category", cats.join(","));
    params.delete("child_category");
  }

  // デフォルト paging
  if (!params.has("page")) params.set("page", "1");
  if (!params.has("per_page")) params.set("per_page", "20");

  // WP の検索 REST を叩く
  const res = await wpFetch(`/wp-json/shipping/v1/search?${params.toString()}`);
  const payload = (await res.json()) as SearchResponse;

  // 応答も互換: product_category → child_category をミラー
  if (payload.data && Array.isArray(payload.data)) {
    const items = payload.data;
    payload.data = items.map((it: WPProduct): WPProduct => {
      const meta: WPProductMeta = { ...(it.meta ?? {}) };
      if (typeof meta.product_category === "string" && !meta.child_category) {
        meta.child_category = meta.product_category;
      }
      return { ...it, meta };
    });
  }

  return new Response(JSON.stringify(payload), { status: res.status });
}

// =======================
// POST: 新規作成
// =======================
export async function POST(request: Request) {
  const body = (await request.json()) as IncomingProductBody;

  // 必須: タイトル（name フォールバック）
  const title = (body.title ?? body.name ?? "").toString().trim();
  if (!title) {
    return new Response(JSON.stringify({ error: "title is required" }), {
      status: 400,
    });
  }

  // 互換: child_category -> product_category に正規化
  const product_category = (
    body.product_category ?? body.child_category ?? ""
  )
    .toString()
    .trim();

  // WP メタ用に整形
  const metaRaw: Record<string, unknown> = {
    cost: num(body.cost),
    length_cm: num(body.length_cm),
    width_cm: num(body.width_cm),
    height_cm: num(body.height_cm),
    weight_g: num(body.weight_g),
    applied_weight_g: num(body.applied_weight_g),
    shipping_actual_yen: num(body.shipping_actual_yen),
    carrier: text(body.carrier),
    amazon_size_label: text(body.amazon_size_label),
    product_category: product_category || undefined,
  };

  const meta = Object.fromEntries(
    Object.entries(metaRaw).filter(([, v]) => v !== undefined)
  );

  // -------------------------------
  // product_sheet の決定ロジック
  // -------------------------------
  let product_sheet_ids: number[] | undefined;

  // ① まずフロントから来た product_sheet を優先して使う
  if (Array.isArray(body.product_sheet)) {
    const ids = body.product_sheet
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));

    if (ids.length > 0) {
      product_sheet_ids = ids;
    }
  }

  // ② product_sheet が無い場合だけ sheet_slug から引く（既存ロジック）
  if (!product_sheet_ids) {
    const sheetSlug = body.sheet_slug?.trim();

    if (sheetSlug) {
      const termRes = await wpFetch(
        `/wp-json/wp/v2/product_sheet?slug=${encodeURIComponent(sheetSlug)}`
      );

      if (termRes.ok) {
        const terms = (await termRes.json()) as { id?: number }[];
        if (
          Array.isArray(terms) &&
          terms.length > 0 &&
          typeof terms[0].id === "number"
        ) {
          product_sheet_ids = [terms[0].id];
        }
      }
    }
  }

  // WP に投げる payload
  const wpPayload: Record<string, unknown> = {
    title,
    status: "publish",
    meta,
  };

  if (product_sheet_ids && product_sheet_ids.length > 0) {
    wpPayload.product_sheet = product_sheet_ids;
  }

  const res = await wpFetch(`/wp-json/wp/v2/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wpPayload),
  });

  const created = (await res.json()) as WPProduct;

  // 応答も互換: product_category を child_category にミラー
  if (created.meta?.product_category && !created.meta.child_category) {
    created.meta.child_category = created.meta.product_category;
  }

  return new Response(JSON.stringify(created), { status: res.status });
}