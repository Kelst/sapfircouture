import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCollections } from "@/actions/collection.actions";
import { CollectionsGrid } from "./collections-grid";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Manage your wedding dress collections
          </p>
        </div>
        <Link href="/admin/collections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      <CollectionsGrid collections={collections} />
    </div>
  );
}
