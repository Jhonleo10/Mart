export default function Loading() {
  return (
    <div className="safe-container flex min-h-[40vh] items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-brand-blue/20 border-t-brand-blue"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
