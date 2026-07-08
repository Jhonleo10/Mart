"use client";



import Link from "next/link";

import { GitCompare, X } from "lucide-react";

import { useComparison } from "./comparison-tray-context";

import { Button } from "@/components/ui/button";



export function ComparisonTray() {

  const { items, remove, clear, compareHref } = useComparison();



  if (items.length === 0) return null;



  return (

    <div className="dash-comparison-tray pointer-events-none">

      <div className="pointer-events-auto rounded-2xl border border-brand-blue/20 bg-white/95 p-4 shadow-2xl shadow-brand-blue/15 backdrop-blur-xl">

        <div className="mb-3 flex items-center justify-between gap-2">

          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">

            <GitCompare className="h-4 w-4 shrink-0 text-brand-blue" />

            <span className="truncate">Compare ({items.length}/2)</span>

          </p>

          <button

            type="button"

            onClick={clear}

            className="shrink-0 text-xs font-medium text-slate-400 hover:text-slate-600"

          >

            Clear

          </button>

        </div>

        <ul className="space-y-2">

          {items.map((item) => (

            <li

              key={item.id}

              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"

            >

              <span className="min-w-0 truncate font-medium text-slate-800">{item.name}</span>

              <button

                type="button"

                onClick={() => remove(item.id)}

                className="shrink-0 text-slate-400 hover:text-red-500"

                aria-label={`Remove ${item.name}`}

              >

                <X className="h-4 w-4" />

              </button>

            </li>

          ))}

        </ul>

        {compareHref ? (

          <Link href={compareHref} className="mt-3 block">

            <Button className="w-full" size="sm">

              Compare side by side

            </Button>

          </Link>

        ) : (

          <p className="mt-3 text-center text-xs text-slate-500">Add one more product to compare</p>

        )}

      </div>

    </div>

  );

}

