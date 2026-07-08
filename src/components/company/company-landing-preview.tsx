export function CompanyLandingPreview({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const previewUrl = `/vendor/${slug}`;

  return (
    <div className="sticky top-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            Open full page →
          </a>
        </div>
        {published ? (
          <iframe
            title="Vendor landing preview"
            src={previewUrl}
            className="h-[min(70vh,640px)] w-full bg-white"
          />
        ) : (
          <div className="flex h-[min(50vh,400px)] flex-col items-center justify-center px-6 text-center">
            <p className="font-medium text-slate-700">Preview unavailable</p>
            <p className="mt-2 text-sm text-slate-500">
              Enable <strong>Publish landing page</strong> and save to preview your standalone vendor site.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
