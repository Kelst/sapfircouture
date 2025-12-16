"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/types/pagination";

interface DataTablePaginationProps {
  pagination: PaginationMeta;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pagination,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps) {
  const { total, page, pageSize, totalPages } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = useCallback(
    (newPage: number, newPageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      if (newPageSize !== undefined) {
        params.set("pageSize", newPageSize.toString());
      }
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  const goToPage = (newPage: number) => {
    router.push(createPageURL(newPage));
  };

  const handlePageSizeChange = (value: string) => {
    router.push(createPageURL(1, parseInt(value)));
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {total} items
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Page {page} of {totalPages || 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(1)}
            disabled={!canGoPrevious}
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(totalPages)}
            disabled={!canGoNext}
            aria-label="Go to last page"
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
