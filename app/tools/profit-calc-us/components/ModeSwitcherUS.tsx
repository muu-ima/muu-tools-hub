"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatIcon from "@/app/tools/profit-calc-uk/components/ChatIcon"; // ← これ使っていい

type ToolModeUS = "normal" | "duty";

export default function ModeSwitcherUS({
  onSelect,
}: {
  onSelect: (mode: ToolModeUS) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (mode: ToolModeUS) => {
    onSelect(mode);
    setOpen(false);
  };

  return (
    <>
      {/* ▼ FAB ボタン */}
      <div className="fixed bottom-6 right-6 z-50 ripple-pulse">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`
            w-14 h-14 rounded-full
            bg-linear-to-br from-blue-500 to-blue-700
            shadow-lg
            flex items-center justify-center
            transition-all duration-300
            cursor-pointer
            relative
            ${open ? "scale-110 shadow-2xl" : "hover:scale-105 hover:shadow-xl"}
          `}
        >
          <div className="animate-bounce">
            <ChatIcon size={30} color="#fff" />
          </div>
        </button>
      </div>

      {/* ▼ メニュー */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.22 }}
            className="
              fixed bottom-24 right-5 z-50
              w-64 rounded-xl bg-white shadow-xl border
              p-4 space-y-3 backdrop-blur-sm
            "
          >
            <h3 className="text-sm font-semibold text-neutral-700">
              モードを選択
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSelect("normal")}
                className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                🔵 通常モード（Normal）
              </button>

              <button
                onClick={() => handleSelect("duty")}
                className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                🟣 関税込みモード（Duty）
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
