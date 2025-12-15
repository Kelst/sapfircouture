"use client";

import { useState, useCallback } from "react";

interface UseUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseUploadResult {
  upload: (file: File) => Promise<string | null>;
  uploadMultiple: (files: File[]) => Promise<string[]>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export function useUpload(options: UseUploadOptions = {}): UseUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
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
        setProgress(100);
        options.onSuccess?.(data.url);
        return data.url;
      } catch (err) {
        const uploadError =
          err instanceof Error ? err : new Error("Upload failed");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<string[]> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const urls: string[] = [];
      const totalFiles = files.length;

      try {
        for (let i = 0; i < files.length; i++) {
          const url = await upload(files[i]);
          if (url) {
            urls.push(url);
          }
          setProgress(((i + 1) / totalFiles) * 100);
        }
        return urls;
      } finally {
        setIsUploading(false);
      }
    },
    [upload]
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
  };
}
