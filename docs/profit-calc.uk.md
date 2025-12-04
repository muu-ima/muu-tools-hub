📘 profit-calc-uk — 完全版ドキュメント（UK 利益計算ツール）

Next.js（App Router）+ TypeScript で構築された、
英国向け商品の利益計算ツール（UK Market Calculator） の完全技術仕様ドキュメントです。

eBay UK / Amazon UK の実務ロジックに基づき、
VAT threshold（135GBP）・プラットフォーム手数料・決済手数料・還付金などを
正確に計算するエンジンを搭載しています。

1. 概要

UK 版利益計算ツールは、次の要素を自動計算します：

VAT 20%（英国税制）

135GBP threshold rule（VAT 負担先が変わる特殊ルール）

プラットフォーム手数料・カテゴリ手数料

Payoneer 手数料（粗利2%）

為替手数料（GBP → JPY）

税還付金（VAT 部分）

最終利益・利益率の算出

さらに、3つのモードを搭載：

Normal Mode（順行計算）

Platform Mode（Inc-VAT 価格 → Ex-VAT 変換モード）

Reverse Mode（二分探索による逆算）

すべての計算は lib/profitCalc.ts に統合されています。

2. ディレクトリ構成
app/
  tools/
    profit-calc-uk/
      page.tsx
      ProfitCalcUK.tsx

      components/
        ChatIcon.tsx
        ExchangeRate.tsx
        Result.tsx
        FinalResultModal.tsx
        ModeSwitcherFab.tsx
        Tooltip.tsx

      hooks/
        useExchange.Rate.ts
        useShipping.ts
        useTimeout.ts
        useProfitCalc.ts

      views/
        NomalView.tsx
        PlatformView.tsx
        ReverseView.tsx

lib/
  profitCalc.ts       // UK 計算ロジックの中心
  vatRule.ts          // VAT ルール（135GBP）
  price.ts            // 通貨変換（GBP ↔ JPY）
  shipping.ts         // 配送料ロジック（共通）

3. UK 利益計算 全体フロー
入力値
（売値・仕入れ値・配送料・カテゴリ・為替）
        ↓
useProfitCalc()
        ↓
lib/profitCalc.ts（コアロジック）
   ├ VAT 判定（vatRule.ts）
   ├ 売上の Ex-VAT/Inc-VAT 分離
   ├ 手数料計算（カテゴリ・決済）
   ├ 還付金ロジック
   ├ 両替コスト
   └ 最終利益 = 売上 - コスト - 手数料 + 還付金
        ↓
Result.tsx（UI 表示）

4. VAT ロジック
🧩 135GBP Threshold Rule

商品の Ex-VAT 価格が 135GBP 以下の場合：

VAT はプラットフォーム側が徴収（マーケットプレイス課税）

出品者の売上には VAT を含まない

手数料も Ex-VAT ベース

135GBP 超の場合：

輸入 VAT（関税に近い扱い）

売上には VAT は乗らない

Ex-VAT のまま計算

export const isLowValueGoods = (exPrice: number) =>
  exPrice <= 135;


VAT 判定は Normal / Platform / Reverse すべてで共有。

5. Mode 別のロジック詳細
5.1 Normal Mode（順行計算）

ユーザーが以下を入力：

売値（Ex-VAT または Inc-VAT を内部で整理）

仕入れ値

配送料

カテゴリ

為替

フロー：

売値 → VAT 判定 → 手数料算出 → 還付金 → 最終利益 → 利益率


通常の順行計算に該当。

5.2 Platform Mode（VAT 込み表示価格 → VAT 抜き計算）

これは あなたが実装している最も重要なモード。
他のツールにはほぼ存在しない実務モード。

🎯 Platform Mode の目的

eBay UK などのプラットフォームでは
表示価格が VAT 込み（Inc-VAT） である。

しかし利益計算は VAT 抜き価格（Ex-VAT） を基準に行わなければならない。

👉 Platform Mode は「Inc-VAT 入力 → Ex-VAT ロジックへ正規化する専用モード」

🧠 Platform Mode の内部動作
① 入力された売値（Inc-VAT）を Ex-VAT に変換
ex_vat = inc_vat / 1.20

② 135GBP threshold を Ex-VAT 基準で判定
if ex_vat <= 135:
    VAT = marketplace が徴収
else:
    通常 VAT（売上は非課税）

③ Ex-VAT に基づき、手数料を計算

カテゴリ手数料

Payoneer 手数料

為替手数料

④ Inc-VAT の VAT 成分から還付金を計算
vat_amount = inc_vat - ex_vat
refund = vat_amount * refund_rate

⑤ 最終利益・利益率を返却

Inc-VAT 価格を正しく UK VAT システムに統合する唯一のモード。

5.3 Reverse Mode（二分探索による逆算）

目標利益率 → 売値を逆算。

アルゴリズム
start = 0
end = 100000
repeat 100:
    mid = (start + end)/2
    result = calc(mid)
    if result.profitRate >= target:
        end = mid
    else:
        start = mid
return mid

特徴

VAT 判定を Normal/Platform と完全統一

配送料や両替コストも同一ロジック

誤差なく安定収束

逆算ロジックは利益計算エンジンを「逆再生」するイメージ。

6. 手数料ロジック
カテゴリ手数料
platform_fee = ex_vat_price * category_rate;

Payoneer 手数料
payoneer_fee = revenue * 0.02

両替コスト（GBP → JPY）
fx_fee = gbp_amount * 3.3円

還付金（VAT の返金）
refund = (inc - ex) * refund_rate

7. 型定義（ProfitInput / ProfitResult）
type ProfitInput = {
  costPrice: number;
  shippingCost: number;
  sellPrice: number; // Ex-VAT or Inc-VAT depending on mode
  currencyRate: number;
  category: string;
  mode: "normal" | "platform" | "reverse";
};

type ProfitResult = {
  revenue: number;
  vat: number;
  fees: { platform: number; payoneer: number; exchange: number };
  refund: number;
  profit: number;
  profitRate: number;
};

8. 関連ファイルまとめ
lib/profitCalc.ts           // 計算の中心
lib/vatRule.ts              // VAT threshold ロジック
lib/price.ts                // 通貨計算
app/tools/profit-calc-uk/hooks/useProfitCalc.ts
app/tools/profit-calc-uk/views/*.tsx
app/tools/profit-calc-uk/components/*.tsx

9. 為替レート取得 API（/api/exchange-rate）

UK / US 利益計算では GBP → JPY, USD → JPY の変換が必要なため、
Next.js 側で外部 API を利用してリアルタイムレートを取得しています。

使用 API：
FloatRates.com（キャッシュ 1 時間 = 海外ツールでもよく使われる安定 API）

🔧 エンドポイント
GET /api/exchange-rate

📌 このエンドポイントの特徴
✔ 1. GBP と USD のレートを並列取得
const urls = {
  GBP: "https://www.floatrates.com/daily/gbp.json",
  USD: "https://www.floatrates.com/daily/usd.json",
};

✔ 2. キャッシュせず “常に最新” を取得
fetch(url, { cache: "no-store" });

✔ 3. 外部 API の不具合（500 / 404 / 429）を 握りつぶさず記録

エラーでも 500 を返さず 200 で返す設計 がミソ。

理由：

UI 側で「最後に成功したレート」を保持できるようにするため
（API ダウンで計算ツールが止まるのを防ぐ）

✔ 4. jpy と JPY の両対応

外部 API が小文字/大文字混在するので両方チェック。

const jpyRate =
  data?.jpy?.rate ??
  data?.JPY?.rate ??
  null;

✔ 5. 取得したレートは小数 3 桁に丸め
Number(jpyRate.toFixed(3));

✔ 6. エラーを配列で返す（開発でデバッグしやすい）
{
  "timestamp": "2025-01-01T00:00:00Z",
  "rates": { "GBP": 189.123, "USD": 151.543 },
  "errors": ["USD: status 500"]
}

✔ 7. 常に 200 を返す（壊れない API）

UI は以下のように fallback 動作に切替可能：

最新レートがあれば使う

取れなければ前回レート

それもなければ "手動入力モード" に切替

10. UK 計算における為替 API の役割

UK 利益計算では 3つの通貨を扱う：

GBP（売上・仕入れ・手数料）

USD（送料や PayPal 手数料）

JPY（最終利益判定）

UI 側では：

useExchangeRate() → /api/exchange-rate → rates.gbpToJpy


これを計算ロジックに渡して：

最終利益（JPY）
利益率（％）
損益分岐点（JPY）


が判定される。

11. UI 側の連携（useExchangeRate hook）

UK / US 両計算ツールで使用している Hook。

const { rate, currency, gbpRate, usdRate, handleRateChange } =
  useExchangeRate();


API から SSR/CSR 関係なく取得

currency 状態（GBP / USD）に応じて切替

利用者が手動で上書きもできる（外貨換算でよく必要になる UX）

12. 貨幣ロジック（lib/price.ts）

為替 API で取得した値をどのように計算に使うかも docs に記載すべき。

例：

export function toJPY(gbp: number, rate: number): number {
  return Math.round(gbp * rate);
}

export function gbpFromIncVat(inc: number): number {
  return inc / 1.2; // 20% VAT
}


Ex-VAT → Inc-VAT

Inc-VAT → Ex-VAT

JPY → GBP

四捨五入

PayPal/Payoneer 3.3円換算

すべてここで統一される。

🔥 docs/profit-calc-uk.md に組み込む「為替セクション 完成版」

ここまでの内容を統合した 貼るだけで完成するセクション がこちら👇

13. 為替レート取得 API（/api/exchange-rate）

UK 利益計算では、GBP → JPY の換算が必要なため
Next.js API Route にてリアルタイムレートを取得しています。

概要

本 API は FloatRates.com を利用し：

GBP → JPY

USD → JPY

を取得し、常に最新レートで計算できるようにしています。

特徴

外部 API をキャッシュせず cache: "no-store" で取得

jpy / JPY キー両対応

外部 API が 500 / 404 / 429 でも 200 で返す安全設計

errors フィールドに詳細を記録

UI は fallback レートを利用可能

計算エンジンは常に最新レートを参照

API 返却例
{
  "timestamp": "2025-01-01T12:00:00.000Z",
  "rates": {
    "GBP": 189.235,
    "USD": 150.452
  },
  "errors": []
}

UI 連携（useExchangeRate）
const { gbpRate, usdRate, currency } = useExchangeRate();

計算ロジックへの影響

最終利益（JPY）

利益率（％）

両替手数料（Payoneer 3.3円）

送料（USD → GBP / → JPY）

すべて為替 API で取得したレートを基準に計算される。

14. まとめ

UK 利益計算ツールは：

VAT threshold（135GBP）を完全再現

Inc-VAT → Ex-VAT 変換基盤を Platform Mode に統合

二分探索による逆算が正確

手数料・還付金・為替をすべて含んだ完全利益計算

という、実務レベルのエンジンを Next.js + TypeScript で実装した高品質ツールです。