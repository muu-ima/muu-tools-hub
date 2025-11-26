import ProfitCalcUK from "@/app/tools/profit-calc-uk/ProfitCalcUK";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  // ← ここを Promise にする
  searchParams: Promise<{ mode?: string }>;
}) {
  // ← まず unwrap する
  const params = await searchParams;

  const initialMode =
    params.mode === "reverse"
      ? "reverse"
      : params.mode === "platform"
      ? "platform"
      : "normal";

  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-neutral-500">
          モードを準備しています…
        </div>
      }
    >
      <ProfitCalcUK initialMode={initialMode} />
    </Suspense>
  );
}
