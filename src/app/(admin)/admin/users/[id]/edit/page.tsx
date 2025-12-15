import { notFound } from "next/navigation";
import { getUserById } from "@/actions/user.actions";
import { UserForm } from "@/components/admin/user-form";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return <UserForm user={user} />;
}
