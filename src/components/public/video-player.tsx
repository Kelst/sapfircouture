"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Dynamic import for Plyr to avoid SSR issues
let Plyr: typeof import("plyr").default;

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, className, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<InstanceType<typeof Plyr> | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Dynamic import Plyr
    const initPlyr = async () => {
      const PlyrModule = await import("plyr");
      Plyr = PlyrModule.default;

      if (!videoRef.current) return;

      // Initialize Plyr
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "fullscreen",
        ],
        muted: true,
        hideControls: true,
        resetOnEnd: true,
        tooltips: { controls: false, seek: true },
        keyboard: { focused: true, global: false },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        storage: { enabled: false },
      });

      // Ensure video stays muted and volume is 0
      playerRef.current.muted = true;
      playerRef.current.volume = 0;

      // Also mute the underlying video element
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }

      // Auto play if requested
      if (autoPlay) {
        playerRef.current.play();
      }
    };

    initPlyr();

    return () => {
      playerRef.current?.destroy();
    };
  }, [autoPlay]);

  // Update source when src changes
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.source = {
        type: "video",
        sources: [{ src, type: "video/mp4" }],
      };
      if (autoPlay) {
        playerRef.current.play();
      }
    }
  }, [src, autoPlay]);

  return (
    <div className={cn("plyr-wrapper", className)}>
      <video
        ref={videoRef}
        className="plyr-video"
        muted
        playsInline
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
