"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductBookDemoPath } from "@/lib/product-public-url";
import { cn } from "@/lib/utils";

export type HeroBubbleProduct = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  imageUrl?: string | null;
};

const HERO_BUBBLE_LIMIT = 10;

const DRIFT_CLASSES = [
  "hero-bubble-motion-a",
  "hero-bubble-motion-b",
  "hero-bubble-motion-c",
  "hero-bubble-motion-d",
  "hero-bubble-motion-e",
  "hero-bubble-motion-f",
  "hero-bubble-motion-g",
  "hero-bubble-motion-h",
] as const;

/** Organic constellation — no circular orbit */
const CONSTELLATION_SLOTS: { x: number; y: number; size: number }[] = [
  { x: 50, y: 16, size: 52 },
  { x: 20, y: 30, size: 48 },
  { x: 80, y: 28, size: 50 },
  { x: 10, y: 54, size: 46 },
  { x: 36, y: 46, size: 54 },
  { x: 64, y: 48, size: 52 },
  { x: 90, y: 52, size: 48 },
  { x: 26, y: 74, size: 50 },
  { x: 52, y: 82, size: 54 },
  { x: 76, y: 72, size: 48 },
];

function showcaseSlot(index: number) {
  return CONSTELLATION_SLOTS[index % CONSTELLATION_SLOTS.length];
}

interface HeroProductBubblesProps {
  products: HeroBubbleProduct[];
}

export function HeroProductBubbles({ products }: HeroProductBubblesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = products.slice(0, HERO_BUBBLE_LIMIT);

  const slots = useMemo(
    () =>
      items.map((_, i) => ({
        ...showcaseSlot(i),
        drift: DRIFT_CLASSES[i % DRIFT_CLASSES.length],
        delay: i * 0.35,
        rank: i + 1,
      })),
    [items.length],
  );

  const setActive = useCallback((id: string | null) => setActiveId(id), []);

  if (items.length === 0) return null;

  return (
    <div className="hero-bubble-constellation" aria-label="Top rated, viewed, and booked products">
      <div className="hero-constellation-glow" aria-hidden />
      <div className="hero-constellation-mesh" aria-hidden />

      {items.map((product, i) => {
        const slot = slots[i];
        const href = getProductBookDemoPath(product.slug);
        const isActive = activeId === product.id;
        const initial = product.name.charAt(0).toUpperCase();

        return (
          <div
            key={product.id}
            className="hero-constellation-anchor"
            style={
              {
                "--bubble-x": `${slot.x}%`,
                "--bubble-y": `${slot.y}%`,
              } as React.CSSProperties
            }
          >
            <Link
              href={href}
              className={cn(
                "hero-bubble-link hero-constellation-link",
                slot.drift,
                isActive && "hero-bubble-link-active",
              )}
              style={
                {
                  animationDelay: `${slot.delay}s`,
                  "--bubble-size": `${slot.size}px`,
                } as React.CSSProperties
              }
              onMouseEnter={() => setActive(product.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(product.id)}
              onBlur={() => setActive(null)}
            >
              <span className="hero-constellation-rank" aria-hidden>
                {slot.rank}
              </span>

              <span className="hero-bubble-tooltip" role="tooltip">
                <span className="hero-bubble-tooltip-name">{product.name}</span>
                <span className="hero-bubble-tooltip-cat">{product.categoryName}</span>
              </span>

              <span className="hero-bubble-sphere">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes={`${slot.size}px`}
                  />
                ) : (
                  <span className="hero-bubble-fallback">{initial}</span>
                )}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
