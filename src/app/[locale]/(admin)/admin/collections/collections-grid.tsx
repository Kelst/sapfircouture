"use client";

import { useState, useTransition } from "react";
import { CollectionCard } from "@/components/admin/collection-card";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { deleteCollection } from "@/actions/collection.actions";
import { toast } from "sonner";
import type { Collection } from "@/lib/db/schema";

interface CollectionsGridProps {
  collections: (Collection & { dresses: { id: string }[] })[];
}

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteCollection(deleteId);

      if (result.success) {
        toast.success("Collection deleted");
      } else {
        setErrorMessage(result.error || "Failed to delete collection");
      }

      setDeleteId(null);
    });
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">No collections yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first collection to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onDelete={setDeleteId}
          />
        ))}
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? This action cannot be undone."
        isDeleting={isPending}
      />

      {/* Error Dialog */}
      <AlertDialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cannot Delete Collection
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setErrorMessage(null)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
