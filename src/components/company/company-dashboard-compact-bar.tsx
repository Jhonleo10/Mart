import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ChevronRight, Lock, Sparkles } from "lucide-react";
import type { SetupStep } from "@/lib/company-setup";
import { setupProgress } from "@/lib/company-setup";
import type { CompanyAiSuggestion } from "@/lib/company-ai-suggestions";
import { cn } from "@/lib/utils";

interface CompanyDashboardCompactBarProps {
  setupSteps: SetupStep[];
  previewHref?: string;
  suggestions: CompanyAiSuggestion[];
  aiLocked: boolean;
  aiHeadline: string;
  aiHref: string;
}

export function CompanyDashboardCompactBar({
  setupSteps,
  previewHref,
  suggestions,
  aiLocked,
  aiHeadline,
  aiHref,
}: CompanyDashboardCompactBarProps) {
  const progress = setupProgress(setupSteps);
  const setupComplete = progress >= 100;
  const nextStep = setupSteps.find((s) => !s.done);
  const topSuggestion = suggestions.find((s) => !s.title.toLowerCase().includes("unlock genius ai"));

  const showSetup = !setupComplete && nextStep;
  const showAiInsight = aiLocked;
  const showSuggestion = !!topSuggestion;

  if (!showSetup && !showAiInsight && !showSuggestion) return null;

  return (
    <div className="company-insight-ribbon mb-5" role="region" aria-label="Setup and AI insights">
      <div className="company-insight-ribbon-track">
        {showSetup && (
          <Link href={nextStep!.href} className="company-insight-chip company-insight-chip-setup">
            <span
              className="company-insight-ring"
              style={{ "--ring-progress": `${progress}` } as CSSProperties}
              aria-hidden
            >
              <span className="company-insight-ring-inner">{progress}%</span>
            </span>
            <span className="company-insight-chip-copy">
              <span className="company-insight-chip-eyebrow">Setup</span>
              <span className="company-insight-chip-title">{nextStep!.label}</span>
            </span>
            <ChevronRight className="company-insight-chip-chevron" aria-hidden />
          </Link>
        )}

        {showSuggestion && (
          <Link href={topSuggestion!.href} className="company-insight-chip company-insight-chip-tip">
            <span className="company-insight-chip-icon company-insight-chip-icon-blue">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="company-insight-chip-copy">
              <span className="company-insight-chip-eyebrow">AI tip</span>
              <span className="company-insight-chip-title">{topSuggestion!.title}</span>
            </span>
            <span className="company-insight-chip-pill">{topSuggestion!.actionLabel}</span>
          </Link>
        )}

        {showAiInsight && (
          <Link href={aiHref} className="company-insight-chip company-insight-chip-ai">
            <span className="company-insight-chip-icon company-insight-chip-icon-violet">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <span className="company-insight-chip-copy">
              <span className="company-insight-chip-eyebrow">Genius AI</span>
              <span className="company-insight-chip-title">{aiHeadline}</span>
            </span>
            <span className="company-insight-chip-pill company-insight-chip-pill-pro">
              Upgrade
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        )}

        {showSetup && previewHref && (
          <Link
            href={previewHref}
            target="_blank"
            className={cn("company-insight-chip company-insight-chip-ghost")}
          >
            <span className="company-insight-chip-copy">
              <span className="company-insight-chip-title">Preview storefront</span>
            </span>
            <ArrowRight className="company-insight-chip-chevron" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
