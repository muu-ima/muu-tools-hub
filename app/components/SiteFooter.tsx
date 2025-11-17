// app/components/SiteFooter.tsx
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 text-xs md:text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>© {year} Cocco Neil. All rights reserved.</span>
        <span className="text-[11px] md:text-xs">
          Internal tools for shipment, profit calc & reservation management.
        </span>
      </div>
    </footer>
  );
}
