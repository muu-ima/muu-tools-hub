"use client";
import { useEffect, useState, useMemo } from "react";
import { getCheapestShipping, ShippingData } from "@/lib/shipping";

export type ShippingResult = {
  method: string;
  price: number | null;
};

export function useShippingUS() {
  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });

  // 配送料 JSON 読み込み
  useEffect(() => {
    fetch("/data/shipping.json")
      .then(res => res.json())
      .then(data => setShippingRates(data));
  }, []);

  // useMemo → ESLint OK（useEffect-setState禁止を回避）
  const result: ShippingResult | null = useMemo(() => {
    if (!shippingRates || weight == null || weight <= 0) return null;
    return getCheapestShipping(shippingRates, weight, dimensions);
  }, [shippingRates, weight, dimensions]);

  return {
    weight,
    setWeight,
    dimensions,
    setDimensions,
    result,
  };
}
