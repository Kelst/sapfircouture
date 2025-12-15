import { notFound } from "next/navigation";
import { getCollectionById } from "@/actions/collection.actions";
import { DressForm } from "@/components/admin/dress-form";

interface NewDressPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewDressPage({ params }: NewDressPageProps) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return <DressForm collectionId={id} />;
}
