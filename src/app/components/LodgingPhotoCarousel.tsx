"use client";

import { useEffect, useMemo, useState } from "react";

type LodgingPhotoCarouselProps = {
  images?: string[];
  title: string;
  className?: string;
};

export function LodgingPhotoCarousel({
  images = [],
  title,
  className = "",
}: LodgingPhotoCarouselProps) {
  const photos = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleIndex = photos.length > 0 ? activeIndex % photos.length : 0;

  useEffect(() => {
    if (photos.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [photos.length]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--surface-soft)] ${className}`}>
      {photos.map((photo, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === visibleIndex ? "opacity-100" : "opacity-0"
          }`}
          key={photo}
          src={photo}
        />
      ))}
      {photos.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((photo, index) => (
            <span
              className={`h-1.5 rounded-full transition-all ${
                index === visibleIndex ? "w-5 bg-white" : "w-1.5 bg-white/65"
              }`}
              key={photo}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
