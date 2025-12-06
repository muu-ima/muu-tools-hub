"use client";

import React, { useState } from "react";
import NormalView from "@/app/tools/profit-calc-us/views/NormalView";
import DutyView from "@/app/tools/profit-calc-us/views/DutyView";
import ModeSwitcherFab from "@/app/tools/profit-calc-us/components/ModeSwitcherUS";

type ToolModeUS = "normal" | "duty";

export default function ProfitCalcUS() {
  const [mode, setMode] = useState<ToolModeUS>("normal");

  return (
    <div className="relative min-h-screen">
      {/* ▼ モードごとに View 切り替え */}
      {mode === "normal" && <NormalView />}
      {mode === "duty" && <DutyView />}

      {/* ▼ 右下のモードチェンジャー */}
      <ModeSwitcherFab
        onSelect={(m) => {
          // 既存の ModeSwitcherFab は normal / reverse / platform を返す
          // US 用にマッピングする
          if (m === "normal") setMode("normal");
          if (m === "duty") setMode("duty"); // duty に割り当てる（仮）
        }}
      />
    </div>
  );
}
