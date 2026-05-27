// app/api/exchange-rate/route.ts
import { NextResponse } from "next/server";

type FloatRateResponse = {
    jpy?: {
        rate?: number | string;
    };
    JPY?: {
        rate?: number | string;
    };
    [key: string]: unknown;
}

export const dynamic = "force-dynamic";

function parseRate(rate: number | string | undefined): number | null {
  if (typeof rate === "number" && Number.isFinite(rate)) {
    return rate;
  }

  if (typeof rate === "string") {
    const parsed = Number(rate);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
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
      const jpyRate = parseRate(data?.jpy?.rate ?? data?.JPY?.rate);

      if (jpyRate !== null) {
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
