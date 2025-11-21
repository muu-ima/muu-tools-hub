import ProfitCalcUK from "@/app/tools/profit-calc-uk/ProfitCalcUK";

export default function Page({ searchParams }: { searchParams: { mode?: string } }) {
  const initialMode =
    searchParams.mode === "reverse"
      ? "reverse"
      : searchParams.mode === "platform"
      ? "platform"
      : "normal";

  return <ProfitCalcUK initialMode={initialMode} />;
}
