// components/ChatIcon.tsx
import React from "react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

export default function ChatIcon({
  size = 28,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <ChatBubbleLeftEllipsisIcon
      className="animate-bounce"
      style={{ width: size, height: size, color }}
    />
  );
}
