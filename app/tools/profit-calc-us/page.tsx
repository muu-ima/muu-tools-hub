import ProfitCalcUS from "@/app/tools/profit-calc-us/ProfitCalcUS";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;

  // URL の mode パラメータ →　"normal" | "duty" にマッピング
  const initialMode: "normal" | "duty" =
    params.mode === "duty" ? "duty" : "normal";

    return (
      <Suspense
        fallback={
          <div className="p-4 text-sm text-neutral-500">
            モードを準備しています…
          </div>
        }
      >
        <ProfitCalcUS initialMode={initialMode} />
      </Suspense>
    );
  }

