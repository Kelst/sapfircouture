"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, ImageIcon, ChevronLeft, ChevronRight, Video, Play, X, Maximize2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Dress, Style } from "@/lib/db/schema";

interface DressCardProps {
  dress: Dress & { style?: Style | null };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublished?: (id: string, isPublished: boolean) => void;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export function DressCard({
  dress,
  onEdit,
  onDelete,
  onTogglePublished,
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
}: DressCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideos, setShowVideos] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const isMobile = useIsMobile();
  const mainImage = dress.images[0];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : dress.images.length - 1
    );
  };

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev < dress.images.length - 1 ? prev + 1 : 0
    );
  }, [dress.images.length]);

  const goToPreviousCallback = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : dress.images.length - 1
    );
  }, [dress.images.length]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!fullscreenImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setFullscreenImage(false);
          break;
        case "ArrowLeft":
          goToPreviousCallback();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenImage, goToNext, goToPreviousCallback]);

  return (
    <>
      <Card
        className={`overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => {
          if (selectionMode && onSelectionChange) {
            onSelectionChange(dress.id, !isSelected);
          } else {
            setPreviewOpen(true);
          }
        }}
      >
        <div className="flex">
          {/* Checkbox for selection */}
          {selectionMode && (
            <div
              className="flex items-center justify-center px-3 border-r bg-muted/30"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelectionChange?.(dress.id, checked === true)
                }
              />
            </div>
          )}
          <div className="aspect-square w-20 sm:w-24 md:w-28 relative bg-muted shrink-0">
            {mainImage ? (
              <img
                src={mainImage}
                alt={dress.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="font-medium leading-none truncate">{dress.name}</h3>
                {dress.style && (
                  <p className="text-sm text-muted-foreground truncate">
                    {dress.style.nameEn}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {/* Toggle switch for published status */}
                  {onTogglePublished ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={dress.isPublished}
                        onCheckedChange={(checked) =>
                          onTogglePublished(dress.id, checked)
                        }
                        className="scale-75 origin-left"
                      />
                      <span className="text-xs text-muted-foreground">
                        {dress.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant={dress.isPublished ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {dress.isPublished ? "Published" : "Draft"}
                    </Badge>
                  )}
                  {dress.images.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dress.images.length} {dress.images.length === 1 ? "image" : "images"}
                    </span>
                  )}
                  {dress.videos && dress.videos.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Video className="h-3 w-3" /> {dress.videos.length} {dress.videos.length === 1 ? "video" : "videos"}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onEdit(dress.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(dress.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Preview - Mobile Sheet */}
      {isMobile ? (
        <Sheet open={previewOpen} onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setShowVideos(false);
        }}>
          <SheetContent side="bottom" className="h-[100dvh] p-0 flex flex-col [&>button]:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold truncate">{dress.name}</span>
                <Badge variant={dress.isPublished ? "default" : "secondary"} className="shrink-0">
                  {dress.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Image Gallery - takes most space */}
              <div className="flex-1 relative bg-muted min-h-0">
                {dress.images.length > 0 ? (
                  <>
                    <img
                      src={dress.images[currentImageIndex]}
                      alt={`${dress.name} - Image ${currentImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                      onClick={() => setFullscreenImage(true)}
                    />
                    {/* Fullscreen button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-9 w-9 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => setFullscreenImage(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    {dress.images.length > 1 && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                          onClick={goToPrevious}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                          onClick={goToNext}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                          {currentImageIndex + 1} / {dress.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {dress.images.length > 1 && (
                <div className="flex gap-1.5 p-2 overflow-x-auto bg-background border-t">
                  {dress.images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info & Actions */}
            <div className="border-t bg-background p-3 space-y-3">
              {/* Info Row */}
              <div className="flex items-center gap-4 text-sm">
                {dress.style && (
                  <div>
                    <span className="text-muted-foreground">Style: </span>
                    <span className="font-medium">{dress.style.nameEn}</span>
                  </div>
                )}
                {dress.videos && dress.videos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowVideos(!showVideos)}
                    className="flex items-center gap-1 text-primary"
                  >
                    <Video className="h-4 w-4" />
                    {dress.videos.length} {dress.videos.length === 1 ? "video" : "videos"}
                  </button>
                )}
              </div>

              {/* Videos Section (expandable) */}
              {showVideos && dress.videos && dress.videos.length > 0 && (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      key={dress.videos[currentVideoIndex]}
                      src={dress.videos[currentVideoIndex]}
                      controls
                      muted
                      playsInline
                      className="w-full h-full"
                      preload="metadata"
                    />
                  </div>
                  {dress.videos.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto">
                      {dress.videos.map((videoUrl, idx) => (
                        <button
                          key={videoUrl}
                          type="button"
                          onClick={() => setCurrentVideoIndex(idx)}
                          className={`shrink-0 w-16 h-10 rounded overflow-hidden border-2 transition-colors relative bg-black ${
                            idx === currentVideoIndex ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <video src={videoUrl} className="w-full h-full object-cover" preload="metadata" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-3 w-3 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Edit Button */}
              <Button onClick={() => onEdit(dress.id)} className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Dress
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* Preview - Desktop Dialog */
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="w-[90vw] max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="shrink-0">
              <DialogTitle className="flex items-center gap-2">
                {dress.name}
                <Badge variant={dress.isPublished ? "default" : "secondary"}>
                  {dress.isPublished ? "Published" : "Draft"}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Gallery */}
                <div className="space-y-3">
                  {dress.images.length > 0 ? (
                    <>
                      <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
                        <img
                          src={dress.images[currentImageIndex]}
                          alt={`${dress.name} - Image ${currentImageIndex + 1}`}
                          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                          onClick={() => setFullscreenImage(true)}
                        />
                        {/* Fullscreen button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setFullscreenImage(true)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        {dress.images.length > 1 && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/50 hover:bg-black/70 text-white"
                              onClick={goToPrevious}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/50 hover:bg-black/70 text-white"
                              onClick={goToNext}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                              {currentImageIndex + 1} / {dress.images.length}
                            </div>
                          </>
                        )}
                      </div>
                      {dress.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {dress.images.map((img, idx) => (
                            <button
                              key={img}
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                                idx === currentImageIndex
                                  ? "border-primary"
                                  : "border-transparent hover:border-muted-foreground/50"
                              }`}
                            >
                              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {dress.style && (
                    <div>
                      <p className="text-sm text-muted-foreground">Style</p>
                      <p className="font-medium">{dress.style.nameEn}</p>
                    </div>
                  )}
                  {dress.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{dress.description}</p>
                    </div>
                  )}

                  {/* Video Gallery */}
                  {dress.videos && dress.videos.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {dress.videos.length === 1 ? "Video" : `Videos (${dress.videos.length})`}
                      </p>
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          key={dress.videos[currentVideoIndex]}
                          src={dress.videos[currentVideoIndex]}
                          controls
                          muted
                          playsInline
                          className="w-full h-full [&::-webkit-media-controls-volume-slider]:hidden [&::-webkit-media-controls-mute-button]:hidden"
                          preload="metadata"
                        />
                      </div>
                      {dress.videos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {dress.videos.map((videoUrl, idx) => (
                            <button
                              key={videoUrl}
                              type="button"
                              onClick={() => setCurrentVideoIndex(idx)}
                              className={`shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition-colors relative bg-black ${
                                idx === currentVideoIndex
                                  ? "border-primary"
                                  : "border-transparent hover:border-muted-foreground/50"
                              }`}
                            >
                              <video src={videoUrl} className="w-full h-full object-cover" preload="metadata" muted />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => onEdit(dress.id)} className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Dress
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && dress.images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setFullscreenImage(false)}
        >
          {/* Close button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 bg-white/10 hover:bg-white/20 text-white z-10"
            onClick={() => setFullscreenImage(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image counter */}
          {dress.images.length > 1 && (
            <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1.5 rounded z-10">
              {currentImageIndex + 1} / {dress.images.length}
            </div>
          )}

          {/* Main image */}
          <img
            src={dress.images[currentImageIndex]}
            alt={`${dress.name} - Image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navigation */}
          {dress.images.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {dress.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
              {dress.images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                    idx === currentImageIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
