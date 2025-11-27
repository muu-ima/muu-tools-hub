// app/tools/profit-calc-us/hooks/useShippingUS.ts

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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() =>{
    let cancelled = false;
  
  const fetchShipping = async () => {
    try {
      const res = await fetch("/data/shipping.json");
      const data : ShippingData = await res.json();
      if(!cancelled) {
        setShippingRates(data);
      }
    } catch(error) {
      console.error("shipping.jsonの読み込みに失敗しました",error);
      if(!cancelled) {
        setShippingRates(null);
      }
    } finally {
      if(!cancelled) {
        setIsLoading(false);
      }
    }
  };

  fetchShipping();

  return () => {
    cancelled = true;
  };
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
    isLoading,
  };
}