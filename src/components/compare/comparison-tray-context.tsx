"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
}

interface ComparisonContextValue {
  items: CompareProduct[];
  add: (product: CompareProduct) => void;
  remove: (id: string) => void;
  clear: () => void;
  compareHref: string | null;
}

const STORAGE_KEY = "dgm-compare-tray";
const MAX_ITEMS = 2;

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

function loadStored(): CompareProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompareProduct[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareProduct[]>([]);

  useEffect(() => {
    setItems(loadStored());
  }, []);

  const persist = useCallback((next: CompareProduct[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (product: CompareProduct) => {
      const current = loadStored();
      if (current.some((p) => p.id === product.id)) return;
      if (current.length >= MAX_ITEMS) {
        persist([current[1], product]);
        return;
      }
      persist([...current, product]);
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(loadStored().filter((p) => p.id !== id));
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const compareHref = useMemo(() => {
    if (items.length !== 2) return null;
    return `/compare/${items[0].slug}-vs-${items[1].slug}`;
  }, [items]);

  const value = useMemo(
    () => ({ items, add, remove, clear, compareHref }),
    [items, add, remove, clear, compareHref],
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return ctx;
}

export function useComparisonOptional() {
  return useContext(ComparisonContext);
}
