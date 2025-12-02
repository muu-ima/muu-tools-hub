// src/features/products/hooks/useAppliedWeight.ts
import { useEffect } from "react";
import { toNumOrNull } from "../utils";

export function useAppliedWeight(params: {
  length_cm: string;
  width_cm: string;
  height_cm: string;
  setValue: (v: string) => void;
}) {
  const { length_cm, width_cm, height_cm, setValue } = params;

  useEffect(() => {
    const t = setTimeout(() => {
      const L = toNumOrNull(length_cm);
      const W = toNumOrNull(width_cm);
      const H = toNumOrNull(height_cm);

      if (L != null && W != null && H != null) {
        const applied = Math.round((L * W * H) / 5);
        setValue(String(applied));
      } else {
        setValue("");
      }
    }, 200);

    return () => clearTimeout(t);
  }, [length_cm, width_cm, height_cm, setValue]);
}
