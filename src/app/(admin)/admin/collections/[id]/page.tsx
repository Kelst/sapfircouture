import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Edit } from "lucide-react";
import { getCollectionById } from "@/actions/collection.actions";
import { getDressesByCollectionPaginated } from "@/actions/dress.actions";
import { getStyles } from "@/actions/style.actions";
import { DressesList } from "./dresses-list";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    style?: string;
  }>;
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: CollectionDetailPageProps) {
  const { id } = await params;
  const { page, pageSize, style } = await searchParams;

  const [collection, dressesResult, styles] = await Promise.all([
    getCollectionById(id),
    getDressesByCollectionPaginated(id, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      styleId: style || undefined,
    }),
    getStyles(),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/collections">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground">
              {dressesResult.pagination.total}{" "}
              {dressesResult.pagination.total === 1 ? "dress" : "dresses"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/collections/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Collection
            </Button>
          </Link>
          <Link href={`/admin/collections/${id}/dresses/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Dress
            </Button>
          </Link>
        </div>
      </div>

      <DressesList
        dresses={dressesResult.data}
        collectionId={id}
        styles={styles}
        pagination={dressesResult.pagination}
        currentStyleFilter={style}
      />
    </div>
  );
}
