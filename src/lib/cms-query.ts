const MAX_PAGE_SIZE = 100;

export type ListQuery = {
  page: number;
  pageSize: number;
  skip: number;
  sort: string;
  order: "asc" | "desc";
  status?: string;
  search?: string;
};

export function parseListQuery(
  request: Request,
  options: { defaultSort?: string; allowedSorts: readonly string[] },
): ListQuery {
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.parseInt(params.get("pageSize") ?? "20", 10) || 20),
  );
  const requestedSort = params.get("sort") ?? options.defaultSort ?? "createdAt";
  const sort = options.allowedSorts.includes(requestedSort)
    ? requestedSort
    : options.defaultSort ?? options.allowedSorts[0];
  const order = params.get("order") === "asc" ? "asc" : "desc";
  const status = params.get("status")?.trim().toUpperCase() || undefined;
  const search = params.get("search")?.trim().slice(0, 120) || undefined;
  return { page, pageSize, skip: (page - 1) * pageSize, sort, order, status, search };
}

export function paginationMeta(total: number, query: ListQuery) {
  return {
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize),
  };
}
