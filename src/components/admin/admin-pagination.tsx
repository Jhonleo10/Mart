import { PaginationLink } from "@/components/layout/page-shell";

export const ADMIN_PAGE_SIZE = 10;

export function buildAdminPageHref(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminPagination({
  total,
  page,
  basePath,
  searchParams,
  pageSize = ADMIN_PAGE_SIZE,
}: {
  total: number;
  page: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
  pageSize?: number;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (total <= pageSize) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-pagination">
      <p className="admin-pagination-info">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="admin-pagination-links">
        {page > 1 && (
          <PaginationLink href={buildAdminPageHref(basePath, page - 1, searchParams)}>
            Prev
          </PaginationLink>
        )}
        {pages.map((p) => (
          <PaginationLink
            key={p}
            href={buildAdminPageHref(basePath, p, searchParams)}
            active={p === page}
          >
            {p}
          </PaginationLink>
        ))}
        {page < totalPages && (
          <PaginationLink href={buildAdminPageHref(basePath, page + 1, searchParams)}>
            Next
          </PaginationLink>
        )}
      </div>
    </div>
  );
}
