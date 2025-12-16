"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface LightboxGalleryProps {
  images: string[];
}

export function LightboxGallery({ images }: LightboxGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        <div
          className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-pointer"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          <Image
            src={images[0]}
            alt="Main image"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, i) => (
              <div
                key={i}
                className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  setIndex(i + 1);
                  setOpen(true);
                }}
              >
                <Image
                  src={image}
                  alt={`Image ${i + 2}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
}
