"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  maxChars?: number;
  className?: string;
}

export function ExpandableText({ text, maxChars = 300, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxChars;

  return (
    <div className={cn("break-words overflow-hidden", className)}>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {shouldTruncate && !expanded ? `${text.slice(0, maxChars)}...` : text}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
