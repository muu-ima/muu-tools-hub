# 📘 profit-calc-us — 完全版ドキュメント（US 利益計算ツール）

Next.js（App Router）+ TypeScript で構築された  
**US マーケット（eBay US 想定）の利益計算ツール** の技術仕様です。

州税・手数料税・プラットフォーム手数料・決済手数料・Final Value Fee・Payoneer・為替手数料など、  
US 特有の料金体系をすべて考慮した **最終損益シミュレータ** になっています。

---

## 1. 概要

US 利益計算ツールは、以下を自動計算します：

- 州税 6.71% を含めた売上
- プラットフォーム手数料 / 決済手数料
- Final Value Fee（固定 0.40 USD）
- 手数料に対するタックス（10%）
- Payoneer 手数料（粗利 2%）
- 両替手数料（1USD あたり 3.3 円）
- 税還付金 / 手数料還付金
- 最終損益（JPY ベース）と利益率

為替は `/api/exchange-rate` を通じて取得した  
**USD → JPY レート** を利用します。

---

## 2. ディレクトリ構成

```text
app/
  tools/
    profit-calc-us/
      page.tsx              // エントリーポイント
      ProfitCalcUS.tsx      // メインコンテナ

      components/
        ExchangeRate.tsx    // US 用為替バー
        Result.tsx          // 結果表示
        FinalResultModal.tsx// モーダルでの詳細結果

      hooks/
        useProfitCalcUS.ts  // US 用の計算 Hook

      views/
        NomalView.tsx       // US 版メインビュー（順行計算）
lib/
  profitCalcUS.ts           // US 版コア計算ロジック
  shipping.ts               // 送料ロジック（共通）
  price.ts                  // 通貨変換（USD ↔ JPY）
※ 為替取得 API は UK 版と共通で /api/exchange-rate を利用しています。

3. 計算フロー（全体）

入力値（フォーム）：

売値（USD）

仕入れ（USD）

送料（USD or JSON から自動算出）

カテゴリ手数料率 / 決済手数料率

USD → JPY レート

フロー：

入力
  ↓
useProfitCalcUS()
  ↓
lib/profitCalcUS.ts
  ├ 州税 6.71% 加算
  ├ プラットフォーム手数料
  ├ 決済手数料
  ├ Final Value Fee ($0.40)
  ├ 手数料タックス 10%
  ├ Payoneer 手数料 2%
  ├ 為替手数料（3.3円 / USD）
  ├ 税・手数料還付金
  └ 最終損益 / 利益率
  ↓
Result.tsx / FinalResultModal.tsx

4. 売上・税・手数料ロジック
4.1 売上と州税 6.71%

US 版では、まず 州税を売上に加算 したうえで手数料計算を行います。

const stateTaxRate = 0.0671;

const salesExTax = sellPrice; // 税抜の表示価格
const salesWithStateTax = salesExTax * (1 + stateTaxRate);


salesExTax：プラットフォーム上の税抜売値（想定）

salesWithStateTax：州税込み売上（このベースから手数料を算出）

4.2 プラットフォーム手数料・決済手数料

両方とも 州税込売上 (salesWithStateTax) を基準に計算します。

const platformFee = salesWithStateTax * platformRate; // 例: 0.12
const paymentFee  = salesWithStateTax * paymentRate;  // 例: 0.029 + 固定 etc.


ここでのレートはカテゴリーや決済手段ごとに JSON / 設定から取得可能な構成を想定。

4.3 Final Value Fee（固定 0.40 USD）

eBay US を想定した固定手数料。

const finalValueFee = 0.40;


取引 1 件ごとに必ずかかる。

4.4 手数料タックス（10%）

プラットフォーム手数料や決済手数料に対して
追加で 10% のタックスがかかる 前提。

const feeSubtotal = platformFee + paymentFee + finalValueFee;
const feeTax      = feeSubtotal * 0.10;

4.5 Payoneer 手数料（粗利 2%）

grossProfit（売上 − 仕入 − 送料）に対して 2%。

const grossProfit = salesExTax - cost - shipping;
const payoneerFee = grossProfit * 0.02;

4.6 両替手数料（1USD あたり 3.3 円）

USD → JPY 換金時の手数料を「1USD = 3.3円」で計算。

const fxFeePerUsd = 3.3;
const fxFee = salesExTax * fxRateUsdToJpy > 0
  ? salesExTax * fxFeePerUsd
  : 0;


実装ではもう少し正確に「引き出し額」ベースで計算しているはずですが、
ドキュメント上は “1USDあたり3.3円コスト” と定義。

4.7 税還付金・手数料還付金

US 版でも、税や手数料の一部が還付される前提で
「税還付金」「手数料還付金」を JPY ベースで計上。

const taxRefund      = /* 州税・手数料税に対する還付分 */;
const feeTaxRefund   = /* 手数料税 10% の一部が返るイメージ */;
const totalRefundJpy = (taxRefund + feeTaxRefund) * rateUsdToJpy;


実際には US 税制よりも「社内ロジックとしての還付金」を想定しており、
「最終的に戻ってくる税コスト」を JPY ベースで表現 しています。

5. 最終損益の算出
5.1 基本損益（USD ベース）
const revenueUsd = salesExTax;           // 税抜売上
const totalCostUsd =
  cost + shipping +
  platformFee + paymentFee + finalValueFee +
  feeTax + payoneerFee;

const profitUsd = revenueUsd - totalCostUsd;

5.2 還付金込みの最終損益（JPY ベース）
const revenueJpy = revenueUsd * rateUsdToJpy;
const profitJpy  = profitUsd * rateUsdToJpy;
const finalProfitJpy = profitJpy + totalRefundJpy;
const profitRate = finalProfitJpy / (cost * rateUsdToJpy);


finalProfitJpy：還付金込みの最終損益

profitRate：最終利益率（%）

6. 型定義（TypeScript）
type UsProfitInput = {
  sellPriceUsd: number;
  costUsd: number;
  shippingUsd: number;
  platformRate: number;
  paymentRate: number;
  usdToJpyRate: number;
};

type UsProfitResult = {
  revenueUsd: number;
  revenueJpy: number;
  stateTaxUsd: number;

  platformFeeUsd: number;
  paymentFeeUsd: number;
  finalValueFeeUsd: number;
  feeTaxUsd: number;
  payoneerFeeUsd: number;
  fxFeeJpy: number;

  taxRefundJpy: number;
  feeTaxRefundJpy: number;

  profitUsd: number;
  profitJpy: number;
  finalProfitJpy: number;
  profitRate: number;
};

7. UI アーキテクチャ
NomalView.tsx

フォーム入力

計算ボタン

useProfitCalcUS でロジックを呼び出し

Result コンポーネントに結果を渡す

詳細は FinalResultModal で表示

Result.tsx

売上（税抜 / 州税込）USD & 円換算

配送料（USD & JPY）

仕入れ（USD & JPY）

カテゴリ手数料 / 決済手数料 / 手数料税 / Payoneer 手数料

為替手数料（USD & JPY）

税還付金 / 手数料還付金

利益 / 最終損益 / 利益率（%）

8. 為替レート取得との連携

US 版では /api/exchange-rate の USD レートを利用します。

GET /api/exchange-rate
→ { rates: { USD: 150.452, GBP: ... } }


useExchangeRate または US 専用 Hook で：

USD → JPY レートを取得

UI でレート確認 / 手動上書きも可能な構成

計算ロジックには usdToJpyRate として渡す

9. 将来拡張のアイデア

州税率を州ごとに変更できるようにする（JSON / 設定画面）

プラットフォーム手数料テーブルを WordPress 管理画面から編集

目標利益率から「必要売値」を逆算する US 版 Reverse Mode

利益のブレイクダウンをチャート表示（円グラフ / 積み上げ棒）

10. まとめ

profit-calc-us は：

州税 6.71%

手数料税 10%

Final Value Fee

Payoneer 手数料

為替手数料（3.3円/ドル）

税・手数料還付金

といった US 特有のコスト構造をすべて組み込み、
最終損益を JPY ベースで正確に算出する 実務向けツール です。

Next.js + TypeScript + 独自ロジックで構成されており、
UK 版と合わせて 海外マーケット向け利益計算エンジン として機能します。