"use client";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, FolderOpen } from "lucide-react";
import type { Collection } from "@/lib/db/schema";

interface CollectionCardProps {
  collection: Collection & { dresses: { id: string }[] };
  onDelete: (id: string) => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const dressCount = collection.dresses?.length ?? 0;

  return (
    <Card className="overflow-hidden group">
      <Link href={`/admin/collections/${collection.id}`}>
        <div className="aspect-[4/3] relative bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-muted/80 transition-colors">
          <FolderOpen className="h-12 w-12" />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <Link href={`/admin/collections/${collection.id}`}>
              <h3 className="font-medium leading-none truncate hover:underline">
                {collection.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              {dressCount} {dressCount === 1 ? "dress" : "dresses"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/collections/${collection.id}`}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/collections/${collection.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(collection.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
