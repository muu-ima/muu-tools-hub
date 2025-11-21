// components/ModeSweitcherFab.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatIcon from "./ChatIcon";

type ToolMode = "normal" | "reverse" | "platform";

export default function ModeSwitcherFab({
  onSelect,
}: {
  onSelect: (mode: ToolMode) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ▼ 右下のラッパー（位置 + 波紋だけ担当） */}
      <div
        className="
          fixed bottom-6 right-6 z-50
          ripple-pulse
        "
      >
        {/* ▼ 実際のボタン（相対位置・見た目担当） */}
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

      {/* ▼ モード選択ウィンドウ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.22 }}
            className="
              fixed bottom-24 right-6 z-50
              w-96 rounded-xl bg-white shadow-xl border
              p-4 space-y-3 backdrop-blur-sm
            "
          >
            <h3 className="text-sm font-semibold text-neutral-700">
              モードを選択
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onSelect("normal");
                  setOpen(false);
                }}
                className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                🔵 順行計算（Normal）
              </button>

              <button
                onClick={() => {
                  onSelect("reverse");
                  setOpen(false);
                }}
                className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                🔁 逆算ロジック（Reverse）
              </button>

              <button
                onClick={() => {
                  onSelect("platform");
                  setOpen(false);
                }}
                className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                🟣 最安値モード（Platform）
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
