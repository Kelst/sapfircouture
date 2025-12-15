import { notFound } from "next/navigation";
import { getDressById } from "@/actions/dress.actions";
import { DressForm } from "@/components/admin/dress-form";

interface EditDressPageProps {
  params: Promise<{ id: string; dressId: string }>;
}

export default async function EditDressPage({ params }: EditDressPageProps) {
  const { id, dressId } = await params;
  const dress = await getDressById(dressId);

  if (!dress || dress.collectionId !== id) {
    notFound();
  }

  return <DressForm dress={dress} collectionId={id} />;
}
