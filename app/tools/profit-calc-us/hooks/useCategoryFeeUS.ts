// app/tools/profit-calc-us/hooks/useCategoryFeeUS.ts
"use client";

import { useEffect, useState } from "react";

type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

export function useCategoryFeeUS() {
  const [categoryOptions, setCategoryOptions] = useState<CategoryFeeType[]>([]);
  const [selectedCategoryFee, setSelectedCategoryFee] = useState<number | "">(
    ""
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryFees = async () => {
      try {
        const res = await fetch("/data/categoryFees.json");
        const data: CategoryFeeType[] = await res.json();
        if (!cancelled) {
          setCategoryOptions(data);
        }
      } catch (error) {
        console.error("categoryFees.jsonの取得に失敗しました", error);
        if (!cancelled) {
          setCategoryOptions([]);
        }
      }
    };

    fetchCategoryFees();

    return() => {
        cancelled = true;
    };
  }, []);

  return {
    categoryOptions,
    selectedCategoryFee,
    setSelectedCategoryFee,
  };
}
