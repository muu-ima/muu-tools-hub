// app/api/exchange-rate/route.ts
import { NextResponse } from "next/server";

type FloatRateResponse = {
    jpy?: {
        rate?: number;
    };
    JPY?: {
        rate?: number;
    };
    [key: string]: unknown;
}

export async function GET() {
  const urls = {
    GBP: "https://www.floatrates.com/daily/gbp.json",
    USD: "https://www.floatrates.com/daily/usd.json",
  };

  const rates: Record<string, number> = {};
  const errors: string[] = [];

  for (const [cur, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { cache: "no-store" });

      // 外部APIが 500 / 404 / 429 などのとき
      if (!res.ok) {
        errors.push(`${cur}: status ${res.status}`);
        continue;
      }

      const data: FloatRateResponse = await res.json();

      // 念のため jpy / JPY 両対応
      const jpyRate =
        data?.jpy?.rate ??
        data?.JPY?.rate ??
        null;

      if (typeof jpyRate === "number") {
        rates[cur] = Number(jpyRate.toFixed(3));
      } else {
        errors.push(`${cur}: jpy rate missing`);
      }
    } catch (e) {
       // e は unknown で受ける
      const err = e instanceof Error ? e.message : "unknown error";
       errors.push(`${cur}: ${err}`);
    }
  }

  // ここでは 500 にせず、必ず 200 で返す
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    rates,                         // 取れた分だけ or 空オブジェクト
    errors: errors.length ? errors : undefined,
  });
}
