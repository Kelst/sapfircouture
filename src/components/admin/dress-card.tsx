"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, ImageIcon, ChevronLeft, ChevronRight, Video, Play } from "lucide-react";
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
  const mainImage = dress.images[0];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : dress.images.length - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev < dress.images.length - 1 ? prev + 1 : 0
    );
  };

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
                    {dress.style.name}
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dress.name}
              <Badge variant={dress.isPublished ? "default" : "secondary"}>
                {dress.isPublished ? "Published" : "Draft"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {dress.images.length > 0 ? (
                <>
                  <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    <img
                      src={dress.images[currentImageIndex]}
                      alt={`${dress.name} - Image ${currentImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
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
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
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
                  <p className="font-medium">{dress.style.name}</p>
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
                    {dress.videos.length === 1 ? "Video" : "Videos"}
                  </p>
                  {/* Main Video Player */}
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
                  {/* Video Thumbnails */}
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
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div className="absolute bottom-0.5 right-0.5 text-white text-[9px] bg-black/60 px-1 rounded">
                            {idx + 1}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
