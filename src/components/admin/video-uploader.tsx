"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Upload, X, Video, Play } from "lucide-react";
import { toast } from "sonner";

interface VideoUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxVideos?: number;
  maxSize?: number; // in MB
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoUploader({
  value = [],
  onChange,
  maxVideos = 3,
  maxSize = 100,
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>({});
  const [dialogVideo, setDialogVideo] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadWithProgress = useCallback(
    (file: File): Promise<{ url: string; type: string }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        const formData = new FormData();
        formData.append("file", file);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    },
    []
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (value.length >= maxVideos) {
        toast.error(`Maximum ${maxVideos} videos allowed`);
        return;
      }

      const file = files[0];

      // Validate file type
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Allowed: MP4, WebM, MOV");
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`File too large. Maximum size: ${maxSize}MB`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const data = await uploadWithProgress(file);
        onChange([...value, data.url]);
        toast.success("Video uploaded successfully");
      } catch (error) {
        if (error instanceof Error && error.message !== "Upload cancelled") {
          toast.error(error.message || "Failed to upload video");
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
      }
    },
    [maxSize, maxVideos, value, onChange, uploadWithProgress]
  );

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
      toast.info("Upload cancelled");
    }
  };

  const removeVideo = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVideos = [...value];
    newVideos.splice(index, 1);
    onChange(newVideos);
  };

  const handleLoadedMetadata = (url: string, duration: number) => {
    setVideoDurations((prev) => ({ ...prev, [url]: duration }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={isUploading || value.length >= maxVideos}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          id="video-upload"
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading || value.length >= maxVideos}
          onClick={() => document.getElementById("video-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Video"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxVideos} videos (MP4, WebM, max {maxSize}MB)
        </span>
      </div>

      {isUploading && (
        <Card className="w-48">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground animate-pulse" />
                <span className="text-xs">Uploading...</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={cancelUpload}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">
              {uploadProgress}%
            </p>
          </CardContent>
        </Card>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <Card
              key={url}
              className="w-32 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
              onClick={() => setDialogVideo(url)}
            >
              <div className="relative aspect-video bg-black">
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    handleLoadedMetadata(url, video.duration);
                  }}
                  preload="metadata"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <Play className="h-6 w-6 text-white" />
                </div>
                {videoDurations[url] && (
                  <div className="absolute bottom-1 right-1 text-white text-[10px] bg-black/60 px-1 rounded">
                    {formatDuration(videoDurations[url])}
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Video className="h-3 w-3" />
                    <span>{index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={(e) => removeVideo(index, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={!!dialogVideo} onOpenChange={() => setDialogVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          {dialogVideo && (
            <video
              src={dialogVideo}
              controls
              muted
              autoPlay
              playsInline
              className="w-full h-auto max-h-[80vh] [&::-webkit-media-controls-volume-slider]:hidden [&::-webkit-media-controls-mute-button]:hidden"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
