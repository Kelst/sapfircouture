"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
  onClearSelection,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 p-3 bg-muted/80 backdrop-blur rounded-lg border mb-4">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </span>
      <div className="flex-1" />
      <Button variant="outline" size="sm" onClick={onPublish}>
        <Eye className="mr-2 h-4 w-4" />
        Publish
      </Button>
      <Button variant="outline" size="sm" onClick={onUnpublish}>
        <EyeOff className="mr-2 h-4 w-4" />
        Unpublish
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClearSelection}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
