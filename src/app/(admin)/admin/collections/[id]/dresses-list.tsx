"use client";

import { useState, useTransition, useOptimistic, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DressCard } from "@/components/admin/dress-card";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { BulkActionsToolbar } from "@/components/admin/bulk-actions-toolbar";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteDress,
  toggleDressPublished,
  bulkToggleDressesPublished,
  bulkDeleteDresses,
} from "@/actions/dress.actions";
import { toast } from "sonner";
import type { Dress, Style } from "@/lib/db/schema";
import type { PaginationMeta } from "@/types/pagination";

interface DressesListProps {
  dresses: (Dress & { style?: Style | null })[];
  collectionId: string;
  styles: Style[];
  pagination?: PaginationMeta;
  currentStyleFilter?: string;
}

type BulkAction = "publish" | "unpublish" | "delete" | null;

export function DressesList({
  dresses,
  collectionId,
  styles,
  pagination,
  currentStyleFilter,
}: DressesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [isBulkPending, startBulkTransition] = useTransition();

  // URL-based style filter
  const handleStyleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete("style");
      } else {
        params.set("style", value);
      }
      params.set("page", "1"); // Reset to first page when filter changes
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router]
  );

  // Optimistic updates for toggle published
  const [optimisticDresses, updateOptimisticDresses] = useOptimistic(
    dresses,
    (state, { id, isPublished }: { id: string; isPublished: boolean }) =>
      state.map((d) => (d.id === id ? { ...d, isPublished } : d))
  );

  const selectionMode = selectedIds.size > 0;
  const isAllSelected = selectedIds.size === optimisticDresses.length && optimisticDresses.length > 0;
  const selectedCount = selectedIds.size;

  // Selection handlers
  const toggleSelection = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(optimisticDresses.map((d) => d.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Single dress delete
  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      try {
        await deleteDress(deleteId);
        toast.success("Dress deleted");
        setDeleteId(null);
      } catch (error) {
        toast.error("Failed to delete dress");
      }
    });
  };

  // Single dress toggle published
  const handleTogglePublished = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      updateOptimisticDresses({ id, isPublished });
      try {
        await toggleDressPublished(id, isPublished);
        toast.success(isPublished ? "Dress published" : "Dress unpublished");
      } catch (error) {
        toast.error("Failed to update dress");
      }
    });
  };

  // Bulk action handlers
  const handleBulkPublish = () => {
    startBulkTransition(async () => {
      try {
        await bulkToggleDressesPublished(Array.from(selectedIds), true);
        toast.success(`${selectedCount} dresses published`);
        clearSelection();
        setBulkAction(null);
      } catch (error) {
        toast.error("Failed to publish dresses");
      }
    });
  };

  const handleBulkUnpublish = () => {
    startBulkTransition(async () => {
      try {
        await bulkToggleDressesPublished(Array.from(selectedIds), false);
        toast.success(`${selectedCount} dresses unpublished`);
        clearSelection();
        setBulkAction(null);
      } catch (error) {
        toast.error("Failed to unpublish dresses");
      }
    });
  };

  const handleBulkDelete = () => {
    startBulkTransition(async () => {
      try {
        await bulkDeleteDresses(Array.from(selectedIds), collectionId);
        toast.success(`${selectedCount} dresses deleted`);
        clearSelection();
        setBulkAction(null);
      } catch (error) {
        toast.error("Failed to delete dresses");
      }
    });
  };

  const confirmBulkAction = () => {
    switch (bulkAction) {
      case "publish":
        handleBulkPublish();
        break;
      case "unpublish":
        handleBulkUnpublish();
        break;
      case "delete":
        handleBulkDelete();
        break;
    }
  };

  if (dresses.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">No dresses in this collection</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first dress to this collection
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Select All / Bulk Actions Header */}
      {selectionMode ? (
        <BulkActionsToolbar
          selectedCount={selectedCount}
          onPublish={() => setBulkAction("publish")}
          onUnpublish={() => setBulkAction("unpublish")}
          onDelete={() => setBulkAction("delete")}
          onClearSelection={clearSelection}
        />
      ) : (
        <div className="flex items-center justify-between gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Checkbox
              checked={false}
              onCheckedChange={toggleSelectAll}
            />
            Select all
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Style:</span>
            <Select
              value={currentStyleFilter || "all"}
              onValueChange={handleStyleFilterChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All styles</SelectItem>
                {styles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {optimisticDresses.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">
              {currentStyleFilter
                ? "No dresses match the selected filter"
                : "No dresses in this collection"}
            </p>
          </div>
        ) : (
          optimisticDresses.map((dress) => (
            <DressCard
              key={dress.id}
              dress={dress}
              onEdit={(id) =>
                router.push(`/admin/collections/${collectionId}/dresses/${id}/edit`)
              }
              onDelete={setDeleteId}
              onTogglePublished={handleTogglePublished}
              isSelected={selectedIds.has(dress.id)}
              onSelectionChange={toggleSelection}
              selectionMode={selectionMode}
            />
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <DataTablePagination pagination={pagination} />
      )}

      {/* Single Delete Dialog */}
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Dress"
        description="This will permanently delete this dress. This action cannot be undone."
        isDeleting={isPending}
      />

      {/* Bulk Publish Dialog */}
      <ConfirmDialog
        open={bulkAction === "publish"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        onConfirm={confirmBulkAction}
        title="Publish Dresses"
        description={`Are you sure you want to publish ${selectedCount} ${selectedCount === 1 ? "dress" : "dresses"}? They will be visible on the public website.`}
        confirmText="Publish"
        isLoading={isBulkPending}
      />

      {/* Bulk Unpublish Dialog */}
      <ConfirmDialog
        open={bulkAction === "unpublish"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        onConfirm={confirmBulkAction}
        title="Unpublish Dresses"
        description={`Are you sure you want to unpublish ${selectedCount} ${selectedCount === 1 ? "dress" : "dresses"}? They will be hidden from the public website.`}
        confirmText="Unpublish"
        isLoading={isBulkPending}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkAction === "delete"}
        onOpenChange={(open) => !open && setBulkAction(null)}
        onConfirm={confirmBulkAction}
        title="Delete Dresses"
        description={`Are you sure you want to delete ${selectedCount} ${selectedCount === 1 ? "dress" : "dresses"}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isBulkPending}
      />
    </>
  );
}
