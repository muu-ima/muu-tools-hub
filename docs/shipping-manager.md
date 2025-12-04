📦 Shipping Manager — 完全版ドキュメント

海外発送商品の重量・サイズ・配送方法・実送料を Next.js（App Router）で管理し、
WordPress Products CPT（カスタム投稿タイプ）とリアルタイム同期する 発送管理システム です。

1. 概要

Shipping Manager は以下を目的に設計されています：

商品データ（重量・サイズ・カテゴリ）を UI 上で簡単に編集する

実重量 / 容積重量を一貫したロジックで計算する

JSON で管理された配送テーブルに基づき、最適な配送方法を取得

WordPress の Products CPT と REST API 経由で同期

Next.js の UI と重量・送料ロジックを完全分離した構造

国際配送業務に必要な データ管理 × 計算 × UI/UX を一体化したツールです。

2. ディレクトリ構成
app/
  tools/
    shipping-manager/
      page.tsx                     // 一覧 & ルートコンテナ
      layout.tsx                   // Sidebar + Detail レイアウト

      components/
        DraggableScroll.tsx        // 横スクロール UI
        LoadingOverlay.tsx         // 処理中オーバーレイ
        Modal.tsx                  // 汎用モーダル
        ProductForm.tsx            // メインフォーム
        Sidebar.tsx                // カテゴリ・検索
        Tooltip.tsx                // UI ツールチップ

      forms/
        page.tsx                   // 商品フォームビュー
        entry/
          page.tsx                 // 既存商品の編集
        new/
          page.tsx                 // 新規商品の登録フォーム

関連ロジック・API
features/products/
  api/
    getProducts.ts                // 商品一覧取得
    getProduct.ts                 // 商品単体取得
    updateProduct.ts              // 商品更新（put）
  hooks/
    useProductForm.ts             // フォーム制御
    useAppliedWeight.ts           // 容積重量ロジック
  utils.ts                        // 正規化・変換
  types.ts                        // 型定義

lib/
  shipping.ts                     // 配送料計算（Auto / Manual）
  weight.ts                       // 容積重量・数値変換
  wp.ts                           // REST ヘルパー

3. Shipping Manager の全体アーキテクチャ
┌───────────────┐
│ WordPress Products CPT │
│ meta/taxonomy           │
└───────────────┘
            ↑ REST API
            │  /wp-json/shipping/v1/search
            │  /wp-json/wp/v2/product/:id
            ↓
┌──────────────────────────────┐
│ Next.js App Router            │
│ (shipping-manager pages)      │
│ ┌──────────────────────────┐ │
│ │ ProductsPageClient        │ │
│ │ - 一覧取得                │ │
│ │ - 検索・フィルタリング     │ │
│ └──────────────────────────┘ │
│             ↓                │
│ ┌──────────────────────────┐ │
│ │ ProductForm              │ │
│ │ useProductForm           │ │
│ │ - 入力(重量/サイズ/送料)   │ │
│ │ - バリデーション         │ │
│ │ - 更新(PUT)              │ │
│ └──────────────────────────┘ │
│             ↓                │
│ ┌──────────────────────────┐ │
│ │ lib/shipping.ts          │ │
│ │ - 実重量 / 容積重量        │ │
│ │ - 配送テーブル JSON       │ │
│ │ - 最適配送の算出         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘

4. 主要機能の詳細
4.1 🔍 商品検索 & フィルタリング
対応クエリ

product_category

child_category

name

sku

weight

applied_weight

min/max 範囲検索（重量・サイズ）

特徴

URL パラメータに同期 → リロードしても状態保持

検索結果は ProductsPageClient で管理（グローバル状態化しない）

4.2 📝 商品編集フォーム
編集できる項目

weight_g（実重量）

length_cm / width_cm / height_cm（サイズ）

applied_weight_g（配送適用重量）

shipping_actual_yen（実送料）

product_category / child_category

バリデーション

useProductForm 内で共通処理：

string → number 変換

"" → null

NaN を除外

サイズ変更時に appliedWeight 自動計算

保存時の流れ
入力値 → useProductForm → updateProduct.ts → WordPress PUT


API 更新成功後：

モーダルを閉じる

LoadingOverlay → "保存しました" トースト

一覧を自動リフレッシュ

5. 重量・配送料ロジック（lib/）
5.1 容積重量（weight.ts）
const volume = (length * width * height) / 5000;
return Math.max(actual_weight, Math.ceil(volume));

ポイント

大手キャリア基準 (FedEx / EMS)

5000 ルールを適用

容積重量と実重量の大きい方を採用（applied_weight）

5.2 配送料ロジック（shipping.ts）

Auto モード
applied_weight に基づき、配送テーブル JSON を検索し最安値を返す。

対応：

EMS

FedEx

小型包装物

独自の配送 JSON 追加も可能

Manual モード
ユーザーが配送方法・料金を手動入力するモード。

6. UI アーキテクチャ
Sidebar（一覧絞り込み UI）

カテゴリのツリー表示

検索キーワード入力

条件リセットボタン

表示数・ページネーション

ProductList / ProductRow

必要情報だけの軽量表示

行クリックで詳細パネルを右側に表示

ProductDetail

詳細情報をパネルで表示

「編集する」ボタンでモーダル展開

Modal（中央配置・UI/UX 最適化）

Esc で閉じる

外クリックで閉じる

モーダル内のみスクロール

PC / モバイル両方に最適化

7. REST API の仕様
🔎 検索：GET /wp-json/shipping/v1/search
パラメータ例：
?page=1&per_page=20&product_category=bag&child_category=sling

返却値（例）
{
  "data": [
    {
      "id": 123,
      "title": "Shoulder Bag",
      "meta": {
        "weight_g": 450,
        "length_cm": 35,
        "applied_weight_g": 600
      },
      "categories": ["bag", "sling"]
    }
  ]
}

📝 更新：PUT /wp-json/wp/v2/product/:id

送信データ（例）：

{
  "meta": {
    "weight_g": 500,
    "length_cm": 40,
    "width_cm": 15,
    "height_cm": 10,
    "applied_weight_g": 700,
    "shipping_actual_yen": 1980
  }
}

8. 今後の拡張予定

配送テーブルを WordPress 管理画面から編集可能にする

為替と連動した送料のリアルタイム換算

AI による最適配送方法の自動提案

Laravel API と連携して配送履歴を保存

Shopify / WooCommerce など外部 PL 連携

9. まとめ

Shipping Manager は：

商品管理（WP）

重量・サイズ計算（lib/）

配送料算出（JSON テーブル）

Next.js UI（App Router）

これらを完全に分離しつつ、
リアルタイム連携する 大規模ツール基盤。

Next.js + WordPress の組み合わせとして
かなり拡張性が高く、実務レベルの運用に耐える構成になっています。