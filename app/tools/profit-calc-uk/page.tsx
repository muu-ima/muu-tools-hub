import ProfitCalcUK from "@/app/tools/profit-calc-uk/ProfitCalcUK";
import { Suspense } from "react";

// （オマケだけど安全策として入れておくと良い）
export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const initialMode =
    searchParams.mode === "reverse"
      ? "reverse"
      : searchParams.mode === "platform"
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
