// app/components/Spinner.tsx
export default function Spinner() {
  return (
    <div className="flex justify-center py-4">
      <div
        className="
          h-8 w-8
          rounded-full
          border-[3px]
          border-sky-400/80
          border-t-transparent
          bg-white/60
          shadow-md
          backdrop-blur
          animate-spin
        "
      />
    </div>
  );
}
