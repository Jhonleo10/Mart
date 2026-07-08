"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductLandingGallery({
  images,
}: {
  images: { url: string; alt: string; caption?: string }[];
}) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;

  const current = images[index]!;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="pl-gallery-frame relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xl">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority={index === 0}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform hover:scale-110 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => setIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform hover:scale-110 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {current.caption && (
        <p className="mt-3 text-center text-sm text-slate-500">{current.caption}</p>
      )}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`View screenshot ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-[var(--landing-primary)]" : "w-2 bg-slate-300 hover:bg-slate-400",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
