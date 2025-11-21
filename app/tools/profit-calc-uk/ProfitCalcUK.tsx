"use client";

import React, { useState } from "react";
import NormalView from "@/app/tools/profit-calc-uk/views/NomalView";
import ModeSwitcherFab from "@/app/tools/profit-calc-uk/components/ModeSweitcherFab";

type ToolMode = "normal" | "reverse" | "platform";

export default function ProfitCalcUK({ initialMode }: { initialMode: ToolMode }) {
  const [mode, setMode] = useState<ToolMode>(initialMode);


  return (
    <div className="relative min-h-screen">
      {/* ▼ モードごとに View 切り替え */}
      {mode === "normal" && <NormalView />}

      {mode === "reverse" && (
        <div className="text-neutral-600 p-4 border rounded-lg">
          ReverseView はまだ未実装です
        </div>
      )}

      {mode === "platform" && (
        <div className="text-neutral-600 p-4 border rounded-lg">
          PlatformView はまだ未実装です
        </div>
      )}

      {/* ▼ 右下のモードチェンジャー（Chatアイコン） */}
      <ModeSwitcherFab onSelect={setMode} />
    </div>
  );
}

