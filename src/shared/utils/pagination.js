/**
 * Normalizes pagination metadata across API responses. Some endpoints return
 * `total_pages`, older ones returned `pages`, and a few only return `total`.
 */
export function readPagination(pagination = {}, perPage = 20) {
  const meta = pagination || {};
  const total = Number(meta.total ?? meta.count ?? 0) || 0;
  const reportedPages = Number(meta.total_pages ?? meta.pages);
  const totalPages =
    Number.isFinite(reportedPages) && reportedPages > 0
      ? reportedPages
      : total > 0
        ? Math.ceil(total / perPage)
        : 1;

  return { total, totalPages };
}
