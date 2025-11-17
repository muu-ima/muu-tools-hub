// app/Loading.tsx
import Spinner from "./components/Spinner";
import ToolCardSkeleton from "./components/ToolCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Spinner />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}
