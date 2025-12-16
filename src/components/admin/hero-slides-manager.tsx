"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getHeroSlides,
  deleteHeroSlide,
  toggleHeroSlideActive,
  reorderHeroSlides,
} from "@/actions/hero-slides.actions";
import { HeroSlideForm } from "./hero-slide-form";
import type { HeroSlide } from "@/lib/db/schema";

interface HeroSlidesManagerProps {
  initialSlides: HeroSlide[];
}

export function HeroSlidesManager({ initialSlides }: HeroSlidesManagerProps) {
  const [slides, setSlides] = useState(initialSlides);
  const [editSlide, setEditSlide] = useState<HeroSlide | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Drag and drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const refreshSlides = async () => {
    const updated = await getHeroSlides();
    setSlides(updated);
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    startTransition(async () => {
      try {
        await toggleHeroSlideActive(slide.id);
        toast.success(slide.isActive ? "Slide disabled" : "Slide enabled");
        refreshSlides();
      } catch {
        toast.error("Failed to update slide");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        const result = await deleteHeroSlide(deleteId);
        if (result.success) {
          toast.success("Slide deleted");
          refreshSlides();
        }
      } catch {
        toast.error("Failed to delete slide");
      } finally {
        setDeleteId(null);
      }
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const newSlides = [...slides];
    const draggedSlide = newSlides[dragItem.current];
    newSlides.splice(dragItem.current, 1);
    newSlides.splice(dragOverItem.current, 0, draggedSlide);

    setSlides(newSlides);

    // Update order in database
    const orderedIds = newSlides.map((s) => s.id);
    startTransition(async () => {
      try {
        await reorderHeroSlides(orderedIds);
        toast.success("Order updated");
      } catch {
        toast.error("Failed to update order");
        refreshSlides(); // Revert on error
      }
    });

    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditSlide(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/30">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No hero slides yet</p>
          <Button
            variant="outline"
            onClick={() => {
              setEditSlide(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add your first slide
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide, index) => (
            <Card
              key={slide.id}
              className={`overflow-hidden ${
                !slide.isActive ? "opacity-60" : ""
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Drag Handle */}
                  <div className="flex items-center px-3 bg-muted/50 cursor-grab active:cursor-grabbing border-r">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Image Preview */}
                  <div className="w-48 h-32 relative shrink-0">
                    <img
                      src={slide.image}
                      alt={slide.titleEn || "Hero slide"}
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">
                          {slide.titleEn || slide.titleUk || "Untitled slide"}
                        </h3>
                        {slide.subtitleEn && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {slide.subtitleEn}
                          </p>
                        )}
                        {slide.linkUrl && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Link: {slide.linkUrl}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={slide.isActive}
                          onCheckedChange={() => handleToggleActive(slide)}
                          disabled={isPending}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditSlide(slide);
                            setIsFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(slide.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HeroSlideForm
        slide={editSlide}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={refreshSlides}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero slide? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
