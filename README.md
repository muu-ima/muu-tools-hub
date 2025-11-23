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
- Radix UI（一部）
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
components/
ChatIcon.tsx
ExchangeRate.tsx
FinalResultModal.tsx
ModeSwitcherFab.tsx
Result.tsx
hooks/
useExchangeRate.ts
useShipping.ts
useTimeout.ts
views/
NomalView.tsx
PlatformView.tsx
page.tsx
ProfitCalcUK.tsx

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

- VAT 20%
- **135ポンドルール完全対応**
- USD → GBP → VAT → JPY の正確な変換
- 利益 / 最終利益 / 利益率の自動計算
- 二段変換なしの TypeScript ロジック
- 入力値の型チェック（number / "" を正確にハンドリング）

**関連ファイル：**
- `app/tools/profit-calc-uk/ProfitCalcUK.tsx`
- `lib/vatRule.ts`
- `lib/profitCalc.ts`

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

## 👤 Author

**muu ima**

Next.js / TypeScript / Laravel / WordPress / Docker を使って  
業務支援アプリや予約管理システム、海外利益計算ツールなどを制作している  
**業務ツールクリエイター**。

- 独学 1年でフルスタック構成を習得  
- 設計・ロジック・UI/UX・デプロイまで一貫して制作  
- 社内ツールを中心に、実用性のあるアプリを継続的に開発  
- Tools Hub を軸に、計算ツールやシステムを随時拡張中  
