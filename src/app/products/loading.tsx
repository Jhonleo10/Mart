import { LayoutGrid } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="catalog-page">
      <section className="catalog-body">
        <div className="safe-container">
          <div className="catalog-layout">
            <aside className="catalog-sidebar">
              <div className="catalog-filter-shell animate-pulse">
                <div className="catalog-filter-head">
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                    <div className="h-3 w-36 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="mb-1.5 h-3 w-16 rounded bg-slate-200" />
                      <div className="h-10 w-full rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="catalog-main">
              <div className="catalog-toolbar">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <LayoutGrid className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-5 w-44 rounded bg-slate-200" />
                    <div className="h-3.5 w-32 rounded bg-slate-100" />
                  </div>
                </div>
              </div>

              <div className="catalog-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="catalog-grid-item">
                    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                      <div className="aspect-[16/10] bg-slate-100" />
                      <div className="space-y-2.5 p-4">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                        <div className="h-9 w-full rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
