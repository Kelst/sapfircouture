"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash, AlertCircle } from "lucide-react";
import { StyleForm } from "@/components/admin/style-form";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { deleteStyle, getStyles } from "@/actions/style.actions";
import { toast } from "sonner";
import type { Style } from "@/lib/db/schema";

interface StylesManagerProps {
  initialStyles: Style[];
}

export function StylesManager({ initialStyles }: StylesManagerProps) {
  const [styles, setStyles] = useState(initialStyles);
  const [editStyle, setEditStyle] = useState<Style | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshStyles = async () => {
    const updated = await getStyles();
    setStyles(updated);
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteStyle(deleteId);

      if (result.success) {
        toast.success("Style deleted");
        refreshStyles();
      } else {
        setErrorMessage(result.error || "Failed to delete style");
      }

      setDeleteId(null);
    });
  };

  const handleEdit = (style: Style) => {
    setEditStyle(style);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditStyle(undefined);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Style
        </Button>
      </div>

      {styles.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No styles yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first style to categorize dresses
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {styles.map((style) => (
                <TableRow key={style.id}>
                  <TableCell className="font-medium">{style.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(style)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteId(style.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StyleForm
        style={editStyle}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={refreshStyles}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Style"
        description="Are you sure you want to delete this style? Styles that are used by dresses cannot be deleted."
        isDeleting={isPending}
      />

      {/* Error Dialog */}
      <AlertDialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cannot Delete Style
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
