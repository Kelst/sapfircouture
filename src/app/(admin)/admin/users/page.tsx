import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getUsers } from "@/actions/user.actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { UsersTable } from "@/components/admin/users-table";

export default async function UsersPage() {
  const [users, currentUser] = await Promise.all([
    getUsers(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and access permissions
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </Link>
      </div>

      <UsersTable users={users} currentUserId={currentUser!.id} />
    </div>
  );
}
