"use client";

import { useState } from "react";

export default function Tooltip({
  text,
}: {
  text: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* ボタン部分 */}
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="
          w-5 h-5
          flex items-center justify-center
          text-base font-bold
          rounded-full
          bg-pink-300 text-white
          hover:bg-pink-400
          cursor-pointer
          transition
        "
      >
        ?
      </button>

      {/* Tooltip 本体 */}
      {open && (
        <div
          className="
            absolute left-1/2 -translate-x-1/2 mt-2
            w-64 p-3
            rounded-xl shadow-lg
            bg-white/90 backdrop-blur
            text-xs text-neutral-700
            border border-neutral-200
            z-50
          "
        >
          {text}
        </div>
      )}
    </div>
  );
}
