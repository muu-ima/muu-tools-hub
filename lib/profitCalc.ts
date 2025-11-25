import { isUnder135GBP, applyVAT } from "./vatRule";

/**
 * 最終利益の詳細を計算する
 * @param {Object} params - パラメータオブジェクト
 * @param {number} params.sellingPrice - 売値（GBP）
 * @param {number} params.costPrice - 仕入れ値（JPY）
 * @param {number} params.shippingJPY - 配送料（JPY）
 * @param {number} params.categoryFeeJPY - カテゴリ手数料（JPY）
 * @param {number} params.customsRate - 関税率（%）
 * @param {number} params.platformRate - プラットフォーム手数料率（%）
 * @param {boolean} [params.includeVAT=false] - VATを含めるかどうか
 * @param {number} [params.exchangeRateGBPtoJPY] - GBPからJPYへの為替レート
 * @param {number} [params.targetMargin=0.25] - 目標利益率
 * @returns {Object} 最終利益の詳細
 */
export function calculateFinalProfitDetail({
  sellingPriceGBP,
  shippingJPY,
  categoryFeePercent,
  customsRatePercent,
  payoneerFeePercent,
  costPriceJPY,
  includeVAT = false,
  exchangeRateGBPtoJPY,
}: {
  sellingPriceGBP: number; // 売値（￡）
  costPriceJPY: number; // JPY
  shippingJPY: number; // JPY
  categoryFeePercent: number; // %
  customsRatePercent: number; // 関税 (%)
  payoneerFeePercent: number;
  includeVAT?: boolean;
  exchangeRateGBPtoJPY: number;
}) {
  if (!exchangeRateGBPtoJPY) {
    throw new Error("exchangeRateGBPtoJPY が必要です！");
  }

  // 1. VAT込み売値 (￡)
  const adjustedPriceGBP =
    includeVAT && isUnder135GBP(sellingPriceGBP)
      ? applyVAT(sellingPriceGBP)
      : sellingPriceGBP;
  console.log("1. VAT込み売値 (￡):", adjustedPriceGBP);

  // 2. カテゴリ手数料 (￡)
  const categoryFeeGBP = adjustedPriceGBP * (categoryFeePercent / 100);
  console.log("2.カテゴリ手数料（￡）:", categoryFeeGBP);

  // 3. 関税 (￡)
  const customsFeeGBP = adjustedPriceGBP * (customsRatePercent / 100);
  console.log("3. 関税（￡）:", customsFeeGBP);

  // 4. 粗利 (￡)
  const grossProfitGBP = adjustedPriceGBP - (categoryFeeGBP + customsFeeGBP);
  console.log("4. 粗利（￡）:", grossProfitGBP);

  // 5. Payoneer手数料 (粗利の %) (￡)
  const payoneerFeeGBP = grossProfitGBP * (payoneerFeePercent / 100);
  console.log("5. payoneer手数料（￡）:", payoneerFeeGBP);

  // 6. 総手数料合計 (￡)
  const totalFeesGBP = categoryFeeGBP + payoneerFeeGBP + customsFeeGBP;
  console.log("6. 総手数料合計（￡）:", totalFeesGBP);

  // 7. 手数料引き後の正味収入 (￡) ← VAT込み総額ベース
  const netSellingGBP = adjustedPriceGBP - totalFeesGBP;
  console.log("7. 手数料引き後の正味収入（￡）:", netSellingGBP);

  // 8.両替手数料(JPY)
  const exchangeFeePerGBP = 3.3;
  const exchangeFeeJPY = netSellingGBP * exchangeFeePerGBP;
  console.log("8.両替手数料(JPY)：", exchangeFeeJPY);

  // 9.正味JPY(GBP→JPY換算、両替手数料を引く)
  const netSellingJPY = netSellingGBP * exchangeRateGBPtoJPY - exchangeFeeJPY;

  // 10. VAT分（￡ → JPY）
  const vatAmountGBP = adjustedPriceGBP - sellingPriceGBP;
  const vatAmountJPY = vatAmountGBP * exchangeRateGBPtoJPY;
  // 差額納付分
  const vatToPayGBP = vatAmountGBP;

  // 11. 利益JPY (仕入れ値・送料を引く)
  const netProfitJPY =
    netSellingJPY - vatAmountJPY - costPriceJPY - shippingJPY;

  // 税還付金(JPY)　手数料還付金(JPY)
  const exchangeAdjustmentJPY = (costPriceJPY * 10) / 110;
  const feeRebateJPY = ((categoryFeeGBP * 10) / 100) * exchangeRateGBPtoJPY;

  // 12. 最終損益 (JPY)
  const finalProfitJPY = netProfitJPY + exchangeAdjustmentJPY + feeRebateJPY;

  // 13. 利益率
  const sellingPriceJPY = sellingPriceGBP * exchangeRateGBPtoJPY;

  // 還付金込みの最終利益率
  const profitMargin =
    sellingPriceJPY === 0 ? 0 : (finalProfitJPY / sellingPriceJPY) * 100;

  return {
    sellingPriceGBP,
    sellingPriceJPY,
    adjustedPriceGBP,
    categoryFeeGBP,
    customsFeeGBP,
    costPriceJPY,
    payoneerFeeGBP,
    totalFeesGBP,
    netSellingGBP,
    exchangeFeeJPY,
    netSellingJPY,
    vatAmountGBP,
    vatAmountJPY,
    vatToPayGBP,
    netProfitJPY,
    finalProfitJPY,
    exchangeAdjustmentJPY,
    feeRebateJPY,
    profitMargin,
  };
}

/**
 * カテゴリ手数料額を計算する
 */
export function calculateCategoryFee(
  sellingPrice: number,
  categoryFeePercent: number
): number {
  return sellingPrice * (categoryFeePercent / 100);
}

/**
 * 配送料（GBP）をJPYに換算する
 */
export function convertShippingPriceToJPY(
  shippingPriceGBP: number,
  exchangeRate: number
): number {
  return shippingPriceGBP * exchangeRate;
}

/**
 * 実費合計を計算する
 */
export function calculateActualCost(
  costPrice: number,
  shippingJPY: number,
  categoryFeeJPY: number
): number {
  return costPrice + shippingJPY + categoryFeeJPY;
}

/**
 * 粗利を計算する
 */
export function calculateGrossProfit(
  sellingPrice: number,
  actualCost: number
): number {
  return sellingPrice - actualCost;
}

/**
 * 利益率を計算する
 */
export function calculateProfitMargin(
  grossProfit: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) return 0;
  return (grossProfit / sellingPrice) * 100;
}

/**
 * USD売値を「一度GBPに変換してVATルールを通し、
 * その結果をまたUSD→JPYに変換」して最終利益を出す版
 */
export function calculateFinalProfitDetailFromUSD({
  sellingPriceUSD, // 売値（$）
  costPriceJPY, // 仕入れ（¥）
  shippingJPY, // 送料（¥）
  categoryFeePercent, // カテゴリ手数料 (%)
  customsRatePercent, // 関税 (%)
  payoneerFeePercent, // Payoneer手数料 (%)
  includeVAT = false, // VAT込みで売るかどうか
  exchangeRateUSDtoJPY, // 1 USD → ¥
  exchangeRateGBPtoJPY, // 1 GBP → ¥
}: {
  sellingPriceUSD: number;
  costPriceJPY: number;
  shippingJPY: number;
  categoryFeePercent: number;
  customsRatePercent: number;
  payoneerFeePercent: number;
  includeVAT?: boolean;
  exchangeRateUSDtoJPY: number;
  exchangeRateGBPtoJPY: number;
}) {
  if (!exchangeRateUSDtoJPY || !exchangeRateGBPtoJPY) {
    throw new Error(
      "exchangeRateUSDtoJPY と exchangeRateGBPtoJPY が必要です！"
    );
  }

  // --- ① USD⇔GBP のクロスレートを計算 ---
  const usdToGbp = exchangeRateUSDtoJPY / exchangeRateGBPtoJPY; // 1 USD が何ポンドか
  const gbpToUsd = exchangeRateGBPtoJPY / exchangeRateUSDtoJPY; // 1 GBP が何ドルか

  // --- ② USD売値をGBPに変換して「VAT判定に使うGBP売値」にする ---
  const sellingPriceGBP = sellingPriceUSD * usdToGbp;

  // --- ③ 既存の GBP版ロジックに全部任せる ---
  const base = calculateFinalProfitDetail({
    sellingPriceGBP,
    costPriceJPY,
    shippingJPY,
    categoryFeePercent,
    customsRatePercent,
    payoneerFeePercent,
    includeVAT,
    exchangeRateGBPtoJPY,
  });

  // base の中身:
  // - adjustedPriceGBP, vatAmountGBP, vatToPayGBP, finalProfitJPY, などなど…

  // --- ④ GBPで出た値を「表示用のUSDにも」変換してあげる ---
  const adjustedPriceUSD = base.adjustedPriceGBP * gbpToUsd;
  const vatAmountUSD = base.vatAmountGBP * gbpToUsd;
  const vatToPayUSD = base.vatToPayGBP * gbpToUsd;

  // 「元のドル売値を円に直した値」もあると便利なのでついでに返す
  const sellingPriceUSDJPY = sellingPriceUSD * exchangeRateUSDtoJPY;

  return {
    // まずは既存のGBPベースの情報を全部そのまま返す
    ...base,

    // そこに USD / USD→JPY を追加する
    sellingPriceUSD,
    adjustedPriceUSD,
    vatAmountUSD,
    vatToPayUSD,
    sellingPriceUSDJPY,
  };
}

/**
 * 目標利益率から売値 (GBP, VAT抜き) を二分探索で逆算する
 * - calculateFinalProfitDetail に完全追従
 * - profitMargin は 「売上(円)に対する利益率」として扱う
 */

export function calculateSellingPriceFromProfitRateUK({
  targetProfitRate, // 5 = 5%
  includeVAT = true,
  costPriceJPY,
  shippingJPY,
  categoryFeePercent,
  customsRatePercent,
  payoneerFeePercent,
  exchangeRateGBPtoJPY,
  profitMode = "pure", // "pure" | "final"
   debug = false,  
}: {
  targetProfitRate: number; // パーセント値として扱う (5 = 5%, 30 = 30%)
  includeVAT?: boolean;

  costPriceJPY: number;
  shippingJPY: number;
  categoryFeePercent: number;
  customsRatePercent: number;
  payoneerFeePercent: number;
  exchangeRateGBPtoJPY: number;
  profitMode?: "pure" | "final";
  debug?: boolean;
}): {
  priceGBPExVAT: number; // VAT 抜き売値(内部用)
  priceGBPIncVAT: number; // VAT 抜き売値(内部用)
  priceJPY: number; // VAT込み売値の円換算
} {
  if (!exchangeRateGBPtoJPY) {
    throw new Error("exchageRateGBPtoJPY が必要です");
  }
  if (targetProfitRate < 0) {
    throw new Error("tafgetProfitRate は 0 以上で指定してください");
  }

  const target = targetProfitRate / 100;

  const totalCostJPY = costPriceJPY + shippingJPY;
  if (totalCostJPY <= 0) {
    throw new Error("コスト (仕入 + 送料)が0以下のため利益率が定義できません");
  }

  const basePriceGBP = totalCostJPY / exchangeRateGBPtoJPY || 1;

  let low = basePriceGBP * 0.5;
  if (low < 1) low = 1;
  let high = basePriceGBP * 5;
  if (high < 10) high = 10;

  const tolerance = 0.0001;

   
  // 「売上に対する利益率 (少数)」を計算
  const getProfitRate = (sellingPriceGBPExVAT: number): number => {
    const detail = calculateFinalProfitDetail({
      sellingPriceGBP: sellingPriceGBPExVAT,
      costPriceJPY,
      shippingJPY,
      categoryFeePercent,
      customsRatePercent,
      payoneerFeePercent,
      includeVAT,
      exchangeRateGBPtoJPY,
    });
    // sellingPriceJPY は detail に入ってる前提
    const sellingJPY = detail.sellingPriceJPY;

    // 純利益ベース
    const pureMarginPercent =
      sellingJPY === 0 ? 0 : (detail.netProfitJPY / sellingJPY) * 100;

    // 還付金込み（既存）
    const finalMarginPercent = detail.profitMargin;

    const marginPercent =
      profitMode === "pure" ? pureMarginPercent : finalMarginPercent;

    // 0.05 とかにして返す
    return marginPercent / 100;
  };

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const currentRate = getProfitRate(mid);

      if (debug) {
      console.log(`Iteration ${i}`, {
        low,
        high,
        mid,
        currentProfitRate: currentRate,          // 0.04996...
        currentProfitRatePercent: currentRate * 100, // 4.996...
      });
    }

    if (Math.abs(currentRate - target) < tolerance) {
      low = mid;
      break;
    }

    if (currentRate < target) {
      // 利益率が足りない → もっと値上げ
      low = mid;
    } else {
      // 利益率が高すぎる →　もう少し値下げできる
      high = mid;
    }
  }

    if (debug) {
    console.log("== ReverseCalcUK done ==", {
      targetProfitRatePercent: targetProfitRate,
      finalPriceGBPExVAT: low,
    });
  }

  const priceGBPExVAT = low;

  // ===== VAT ルール（NomalView と揃える） =====
  const VAT_RATE = 0.2;
  const VAT_THRESHOLD_GBP = 135;

  let priceGBPIncVAT: number;
  if (priceGBPExVAT <= VAT_THRESHOLD_GBP) {
    priceGBPIncVAT = priceGBPExVAT * (1 + VAT_RATE);
  } else {
    priceGBPIncVAT = priceGBPExVAT;
  }

  const priceJPY = Math.ceil(priceGBPIncVAT * exchangeRateGBPtoJPY * 100) / 100;

  return {
    priceGBPExVAT,
    priceGBPIncVAT,
    priceJPY,
  };
}

/**
 * 目標利益率から売値 (USD →　GBP, VAT抜き) を二分探索で逆算する
 * - calculateFinalProfitDetail に完全追従
 * - profitMargin は 「売上(円)に対する利益率」として扱う
 */

export function calculateSellingPriceUSDFromProfitRateWithVAT({
  costPriceJPY,
  shippingJPY,
  targetProfitRate,
  categoryFeePercent,
  customsRatePercent,
  payoneerFeePercent,
  includeVAT = true,
  exchangeRateUSDtoJPY,
  exchangeRateGBPtoJPY,
}: {
  costPriceJPY: number;
  shippingJPY: number;
  targetProfitRate: number;
  categoryFeePercent: number;
  customsRatePercent: number;
  payoneerFeePercent: number;
  includeVAT?: boolean;
  exchangeRateUSDtoJPY: number;
  exchangeRateGBPtoJPY: number;
}) {
  if (!exchangeRateUSDtoJPY || !exchangeRateGBPtoJPY) {
    throw new Error("exchangRateUSDtoJPY と exchangeRateGBPtoJPY が必要です");
  }

  const target = targetProfitRate / 100;

  // コストからだいたいの下限・上限をきめる
  const costUSD = costPriceJPY / exchangeRateUSDtoJPY;
  const shippingUSD = shippingJPY / exchangeRateUSDtoJPY;
  const baseUSD = costUSD + shippingUSD || 1;

  let low = Math.max(1, baseUSD * 0.5);
  let high = Math.max(10, baseUSD * 5);
  const tolerance = 0.0001;

  let bestDetail: ReturnType<typeof calculateFinalProfitDetailFromUSD> | null =
    null;

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;

    const detail = calculateFinalProfitDetailFromUSD({
      sellingPriceUSD: mid,
      costPriceJPY,
      shippingJPY,
      categoryFeePercent,
      customsRatePercent,
      payoneerFeePercent,
      includeVAT,
      exchangeRateUSDtoJPY,
      exchangeRateGBPtoJPY,
    });

    // UK側 calculateFinalProfitDetail が profitMargin を持っている想定
    const currentRate = detail.profitMargin / 100;

    bestDetail = detail;

    if (Math.abs(currentRate - target) < tolerance) {
      low = mid;
      break;
    }

    if (currentRate < target) {
      // 利益率が足りない →　売値をあげる
      low = mid;
    } else {
      // 利益率が高すぎ →　もう少し安くてOK
      high = mid;
    }
  }

  const priceUSD = low;
  const priceJPY = Math.ceil(priceUSD * exchangeRateUSDtoJPY * 100) / 100;

  return {
    priceUSD,
    priceJPY,
    detail: bestDetail, // 順行ロジックの結果一式（最終利益, VAT額など）
  };
}
