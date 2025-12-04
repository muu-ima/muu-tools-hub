# 🛠️ Muu Tools Hub

Next.js（App Router）+ TypeScript で構築した  
**海外利益計算・送料計算・為替コンポーネントなどの業務支援ツールを統合したハブアプリケーション** です。

UK / US の利益計算ツール、送料シミュレーター、共通 UI、設定画面などを一元管理でき、  
将来的に WordPress / Laravel API と連携可能な構成を想定しています。

---

# 🚀 技術スタック

- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- Docker（開発用）
- デプロイ: **Vercel**

---

# 📁 プロジェクト構成（実際の構成に基づく）

```text
app/
  globals.css
  layout.tsx
  Loading.tsx
  page.tsx

  tools/
    layout.tsx
    page.tsx

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

    profit-calc-us/
      page.tsx
      ProfitCalcUS.tsx
      components/
        ExchangeRate.tsx
        Result.tsx
        FinalResultModal.tsx
      hooks/
        useProfitCalcUS.ts
      views/
        NomalView.tsx

    shipping-manager/
      page.tsx
      components/
        DraggableScroll.tsx
        LoadingOverlay.tsx
        Modal.tsx
        ProductForm.tsx
        Sidebar.tsx
        Tooltip.tsx
      forms/
        page.tsx
        entry/
          page.tsx
        new/
          page.tsx  
components/
  ExchangeRateBar.tsx
  SiteFooter.tsx
  SiteHeader.tsx
  Spinner.tsx
  ToolCardSkeleton.tsx

lib/
  price.ts
  profitCalc.ts        // UK 版コアロジック
  profitCalcUS.ts      // US 版コアロジック
  shipping.ts
  vatRule.ts
  wp.ts

types/
  profit.ts            // UK 版用型
  profitCalc.ts        // US 版用型

public/
  images / favicon 等

Dockerfile
docker-compose.yml
next.config.ts
package.json
postcss.config.mjs
README.md


🇬🇧 UK 利益計算ツール
✨ 主な機能

VAT 20%（135ポンドルール完全対応）

GBP / USD / JPY の三通貨クロスレート対応

利益 / 純利益 / 最終利益（還付金込み）の自動計算

Payoneer 手数料・カテゴリ手数料・両替手数料を一括計算

入力値の型チェック（number | "" の正確なハンドリング）

🧭 モード構成

Normal Mode
通常の順行計算。売値・仕入れ・配送料から最終利益を算出。

Platform Mode
eBay / Amazon のような「プラットフォーム手数料前提」の計算モード。
VAT 込み / VAT 抜き手数料モードを切り替え可能。

Reverse Mode（逆算モード）
目標利益率から「必要な売値」を二分探索で逆算。

🔄 逆算モード（Reverse Mode）の概要

目標利益率（%）から売値（GBP, Ex-VAT / Inc-VAT）を二分探索で逆算 します。

calculateFinalProfitDetail と完全同期した VAT 判定ロジック

135GBP 閾値 / VAT 20% / 丸め処理 などを一元管理

利益率の解釈

"pure" → 売上ベースの純粋利益率

"final" → 還付金・手数料込みの最終利益率

順行ロジックと逆算ロジックが完全一致

最大 100 回の二分探索で安定収束

関連ファイル

lib/profitCalc.ts

app/tools/profit-calc-uk/views/ReverseView.tsx

🇺🇸 US 利益計算ツール
✨ 主な機能

US マーケット（eBay US 想定）のロジックを実装した利益計算ツールです。

USD → JPY の為替計算（Hub 内 API / JSON から取得）

州税 6.71% を売上に加算したうえで手数料を計算

プラットフォーム手数料・決済手数料を 州税込売上 から算出

Final Value Fee（固定 0.40 USD）を含めた総手数料計算

手数料に対するタックス（10%）を別項目で計上

Payoneer 手数料（粗利 2%）・両替手数料（1USD あたり 3.3 円）を自動計算

税還付金・手数料還付金を JPY ベースで考慮した 最終損益 を表示

📊 表示内容（US）

売上（税抜 / 州税込）USD & 円換算

配送方法 / 配送料（USD & JPY）

仕入れ（USD & JPY）

カテゴリ手数料 / 決済手数料 / 手数料税 / Payoneer 手数料

為替手数料（USD & JPY）

税還付金 / 手数料還付金

利益（売上 − 仕入 − 送料）

最終損益（還付金込み）

利益率（％）

関連ファイル

lib/profitCalcUS.ts

app/tools/profit-calc-us/views/NomalView.tsx

app/tools/profit-calc-us/components/Result.tsx

app/tools/profit-calc-us/components/FinalResultModal.tsx

📦 Shipping Manager（海外発送管理ツール）

海外配送商品の 重量・サイズ・配送方法・実送料 を統合管理するツールです。
WordPress（Products CPT）と連携し、商品メタ情報の 検索・編集・登録・送料計算 を行えます。

✨ 主な機能

商品検索 / 絞り込み（カテゴリ・SKU・重量・サイズなど）

商品メタ編集フォーム手前の認証画面付き

商品メタ編集フォーム（重量 / サイズ / applied weight / 実送料）

実重量 vs 容積重量を自動判定（shipping.ts と同期）

REST API と同期（/wp-json/shipping/v1/search）

モーダル UI・Skeleton・2 ペインレイアウト

🔧 ロジック構成（概要）

Features Layer：Products API（取得 / 更新）

Logic Layer：重量計算・配送料ロジック（shipping.ts / weight.ts）

UI Layer：一覧 / 詳細 / フォーム（Next.js クライアント）

Shipping Manager は「商品データ管理 × 重量計算 × 配送料ロジック」を完全に分離した 3 レイヤー構造で、
WordPress Products と Next.js UI をリアルタイム同期する発送管理システムです。

## 📦 セットアップ

### 1. クローン

```bash
git clone https://github.com/muu-ima/muu-tools-hub.git
cd muu-tools-hub
```

### 2. インストール

```bash
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

👉 http://localhost:3000 にアクセス

---

🧩 各ツールの概要
🇬🇧 UK 利益計算

VAT 自動判定（135GBP ルール含む）

Payoneer 手数料 + 商品カテゴリ手数料

GBP / USD / JPY の三通貨クロスレート対応

Normal / Platform / Reverse の 3 モード

🇺🇸 US 利益計算

州税 6.71% + 手数料税 10%

プラットフォーム手数料・決済手数料・Final Value Fee

Payoneer 手数料（粗利 2%）・両替手数料（1USD あたり 3.3円）

税還付金・手数料還付金を含めた最終損益の表示

📦 送料シミュレーター（共通）

Auto / Manual モード

容積重量 vs 実重量の大きい方を自動採用

JSON ベースで配送テーブルを統合管理

## 👤 Author

**muu ima**

Next.js / TypeScript / Laravel / WordPress / Docker を使って  
業務支援アプリや予約管理システム、海外利益計算ツールなどを制作している  
**業務ツールクリエイター**。

- 独学 1年でフルスタック構成を習得  
- 設計・ロジック・UI/UX・デプロイまで一貫して制作  
- 社内ツールを中心に、実用性のあるアプリを継続的に開発  
- Tools Hub を軸に、計算ツールやシステムを随時拡張中  
