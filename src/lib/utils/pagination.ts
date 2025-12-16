import {
  type PaginationParams,
  type PaginatedResult,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/types/pagination";

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset, limit: pageSize };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
