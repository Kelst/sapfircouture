"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Upload, X, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (value.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      setIsUploading(true);

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          return data.url;
        });

        const urls = await Promise.all(uploadPromises);
        onChange([...value, ...urls]);
        toast.success("Images uploaded successfully");
      } catch {
        toast.error("Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxImages]
  );

  const removeImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
    // Adjust lightbox index if needed
    if (lightboxIndex !== null) {
      if (index === lightboxIndex) {
        setLightboxIndex(null);
      } else if (index < lightboxIndex) {
        setLightboxIndex(lightboxIndex - 1);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newImages = [...value];
    const draggedImage = newImages[dragItem.current];
    newImages.splice(dragItem.current, 1);
    newImages.splice(dragOverItem.current, 0, draggedImage);

    onChange(newImages);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : value.length - 1);
  };

  const goToNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < value.length - 1 ? lightboxIndex + 1 : 0);
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading || value.length >= maxImages}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading || value.length >= maxImages}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Images"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxImages} images
        </span>
      </div>

      {value.length > 0 && (
        <div className="w-full overflow-hidden">
          <div
            className="flex gap-3 pb-3 overflow-x-auto w-full"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
          >
            {value.map((url, index) => (
              <Card
              key={url}
              className="relative group overflow-hidden cursor-move shrink-0 w-40"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div
                className="aspect-[3/4] relative cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </span>
              )}
            </Card>
          ))}
          </div>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          {lightboxIndex !== null && (
            <div className="relative">
              <img
                src={value[lightboxIndex]}
                alt={`Image ${lightboxIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {value.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                {lightboxIndex + 1} / {value.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
