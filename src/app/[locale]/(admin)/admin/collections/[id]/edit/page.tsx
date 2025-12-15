import { notFound } from "next/navigation";
import { getCollectionById } from "@/actions/collection.actions";
import { CollectionForm } from "@/components/admin/collection-form";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return <CollectionForm collection={collection} />;
}
