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

app/
globals.css
layout.tsx
Loading.tsx
page.tsx

tools/
profit-calc-uk/
page.tsx
profitCalcUK.tsx

components/
ChatIcon.tsx
ExchangeRate.tsx
Result.tsx
FinalResultModal.tsx
ModeSwitcherFab.tsx
Tooltip.tsx

hooks/
useExchangeRate.ts
useShipping.ts
useTimeout.ts

views/
NomalView.tsx
PlatformView.tsx
ReverseView.tsx

components/
ExchangeRateBar.tsx
SiteFooter.tsx
SiteHeader.tsx
Spinner.tsx
ToolCardSkeleton.tsx

lib/
price.ts
profitCalc.ts
shipping.ts
vatRule.ts

types/
profit.ts

public/
images / favicon 等

Dockerfile
docker-compose.yml
next.config.ts
package.json
postcss.config.mjs
README.md

## 🇬🇧 UK 利益計算ツール

### ✨ 主な機能

- VAT 20%（135ポンドルール完全対応）
- USD → GBP → VAT → JPY の正確な変換
- 利益 / 純利益 / 最終利益（還付金込み）の自動計算
- 二段変換による TypeScript ロジック
- 入力値の型チェック（number / "" の正確なハンドリング）
- **逆算モード（Reverse Mode）対応**

---

## 🔄 逆算モード（Reverse Mode）

**目標利益率（%）から売値（GBP, Ex-VAT / Inc-VAT）を二分探索で逆算します。**

特徴：

- **calculateFinalProfitDetail に完全追従した VAT 判定ロジック**  
  → VAT 135GBP 閾値、VAT 20%、丸め処理をすべて一元化
- 利益率の解釈：  
  - `"pure"` → 売上ベースの純粋利益率  
  - `"final"` → 還付金・手数料込みの最終利益率
- GBP / USD クロス計算にも対応  
- 順行ロジックと逆算ロジックが完全一致  
- 最大 100 回の二分探索による安定収束

**関連ファイル**  
- `lib/profitCalc.ts`  
- `app/tools/profit-calc-uk/views/ReverseView.tsx`

---

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

VAT 自動判定

135GBP ルールの厳密処理

Payoneer 手数料 + 商品カテゴリ手数料

GBP / USD / JPY の三通貨クロスレート対応

📦 送料シミュレーター

Auto / Manual モード

容積重量 vs 実重量の大きい方を採用

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
