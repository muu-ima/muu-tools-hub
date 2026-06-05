// app/api/exchange-rate/route.ts
import { NextResponse } from "next/server";

type ExchangeRateApiResponse = {
  result?: string;
  time_last_update_utc?: string;
  provider?: string;
  documentation?: string;
  terms_of_use?: string;
  rates?: {
    GBP?: number | string;
    JPY?: number | string;
  };
};

export const dynamic = "force-dynamic";

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/USD";

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

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getRatesFromExchangeRateApi() {
  const data = await fetchJsonWithTimeout<ExchangeRateApiResponse>(
    EXCHANGE_RATE_API_URL,
  );

  if (data.result !== "success") {
    throw new Error(`unexpected result: ${data.result ?? "missing"}`);
  }

  const usdToJpy = parseRate(data.rates?.JPY);
  const usdToGbp = parseRate(data.rates?.GBP);

  if (usdToJpy === null || usdToGbp === null || usdToGbp === 0) {
    throw new Error("JPY or GBP rate missing");
  }

  return {
    timestamp: data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toISOString()
      : new Date().toISOString(),
    rates: {
      GBP: Number((usdToJpy / usdToGbp).toFixed(3)),
      USD: Number(usdToJpy.toFixed(3)),
    },
    provider: "ExchangeRate-API",
    attribution: {
      label: "Rates By Exchange Rate API",
      url: "https://www.exchangerate-api.com",
    },
    source: {
      provider: data.provider,
      documentation: data.documentation,
      termsOfUse: data.terms_of_use,
    },
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getRatesFromExchangeRateApi());
  } catch (e) {
    const err = e instanceof Error ? e.message : "unknown error";

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      rates: {},
      errors: [`ExchangeRate-API: ${err}`],
    });
  }
}
