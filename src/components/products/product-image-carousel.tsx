"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageCarouselProps {
  images: { url: string; alt?: string | null }[];
  productName: string;
  categoryBadge?: React.ReactNode;
  className?: string;
}

export function ProductImageCarousel({
  images,
  productName,
  categoryBadge,
  className,
}: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasMultiple = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (!hasMultiple) return;
      setIndex((next + count) % count);
    },
    [count, hasMultiple],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  if (count === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[16/9] bg-gradient-to-br from-brand-blue/5 to-brand-green/5 sm:aspect-[21/9]",
          className,
        )}
      >
        <div className="flex h-full items-center justify-center">
          <span className="font-heading text-6xl font-bold text-brand-blue/20">
            {productName.charAt(0)}
          </span>
        </div>
        {categoryBadge}
      </div>
    );
  }

  return (
    <div className={cn("group relative", className)}>
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-blue/5 to-brand-green/5 sm:aspect-[21/9]">
        {images.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={image.url}
              alt={image.alt?.trim() || `${productName} screenshot ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={i === 0}
            />
          </div>
        ))}

        {categoryBadge}

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md opacity-100 transition-all hover:bg-white hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 sm:left-4 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md opacity-100 transition-all hover:bg-white hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 sm:right-4 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/55 px-2.5 py-1.5 backdrop-blur-sm">
              {images.map((image, i) => (
                <button
                  key={`dot-${image.url}-${i}`}
                  type="button"
                  aria-label={`View image ${i + 1} of ${count}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === index ? "h-2 w-6 bg-white" : "h-2 w-2 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>

            <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm sm:right-4">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:px-7">
          {images.map((image, i) => (
            <button
              key={`thumb-${image.url}-${i}`}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-24",
                i === index
                  ? "border-brand-blue ring-2 ring-brand-blue/20"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
