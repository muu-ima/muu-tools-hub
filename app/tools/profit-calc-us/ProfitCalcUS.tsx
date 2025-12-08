// app/tools/profit-calc-us/ProfitCalcUS.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import NormalView from "@/app/tools/profit-calc-us/views/NormalView";
import DutyView from "@/app/tools/profit-calc-us/views/DutyView";
import ModeSwitcherUS from "@/app/tools/profit-calc-us/components/ModeSwitcherUS";

type ToolModeUS = "normal" | "duty";

type ProfitCalcUSProps = {
  initialMode?: ToolModeUS;
};

export default function ProfitCalcUS({ initialMode = "normal" }: ProfitCalcUSProps) {
  const [mode, setMode] = useState<ToolModeUS>(initialMode);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (next: ToolModeUS) => {
    setMode(next);

    // 既存のクエリパラメータを維持しつつ mode だけ更新
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("mode", next);

    router.replace(`${pathname}?${sp.toString()}`, {
      scroll: false, // スクロール位置はそのまま
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* ▼ モードごとに View 切り替え */}
      {mode === "normal" && <NormalView />}
      {mode === "duty" && <DutyView />}

      {/* ▼ 右下のモードチェンジャー */}
      <ModeSwitcherUS onSelect={handleSelect} />
    </div>
  );
}
