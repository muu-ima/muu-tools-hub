// app/components/ToolCardSkeleton.tsx
export default function ToolCardSkeleton() {
  return (
    <div
      className="
        animate-pulse rounded-2xl border border-white/40 bg-white/20
        backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.15)]
        p-5
      "
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-slate-300/40 rounded" />
        <div className="h-4 w-10 bg-slate-300/40 rounded-full" />
      </div>

      <div className="h-3 w-48 bg-slate-300/40 rounded mb-2" />
      <div className="h-3 w-36 bg-slate-300/40 rounded" />

      <div className="mt-4 h-3 w-40 bg-slate-300/40 rounded" />
    </div>
  );
}
