"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search software, CRM, ERP..."
          className="h-11 w-full rounded-xl border border-white/30 bg-white/95 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue/15"
          aria-label="Search software"
        />
      </div>
      <Button type="submit" className="h-11 shrink-0 bg-brand-green px-5 hover:bg-brand-green-dark">
        Search
      </Button>
    </form>
  );
}
