import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCollectionsPaginated } from "@/actions/collection.actions";
import { CollectionsGrid } from "./collections-grid";
import { DataTablePagination } from "@/components/admin/data-table-pagination";

interface CollectionsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const { page, pageSize } = await searchParams;
  const result = await getCollectionsPaginated({
    page: page ? parseInt(page) : 1,
    pageSize: pageSize ? parseInt(pageSize) : 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Manage your wedding dress collections ({result.pagination.total} total)
          </p>
        </div>
        <Link href="/admin/collections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      <CollectionsGrid collections={result.data} />

      {result.pagination.totalPages > 1 && (
        <DataTablePagination pagination={result.pagination} />
      )}
    </div>
  );
}
