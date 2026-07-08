import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  LineChart,
  Megaphone,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { CompanyAiSuggestionsPanel } from "@/components/company/company-ai-suggestions-panel";
import { AiApplyToLandingButton } from "@/components/company/ai-apply-to-landing-button";
import { AiApplyToProductButton } from "@/components/company/ai-apply-to-product-button";
import { Button } from "@/components/ui/button";
import type { CompanyAiSuggestion } from "@/lib/company-ai-suggestions";
import type {
  buildAiAudienceInsights,
  buildAiCompetitorInsights,
  buildAiMarketingInsights,
  buildCompanyAdvancedAnalytics,
} from "@/lib/company-analytics";
import { getProductPublicPath } from "@/lib/product-public-url";

type MarketingInsight = Awaited<ReturnType<typeof buildAiMarketingInsights>>[number];
type AudienceInsight = Awaited<ReturnType<typeof buildAiAudienceInsights>>;
type CompetitorInsight = Awaited<ReturnType<typeof buildAiCompetitorInsights>>;
type GrowthInsight = Awaited<ReturnType<typeof buildCompanyAdvancedAnalytics>>;

function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "green",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  tone?: "green" | "blue" | "amber";
}) {
  const tones = {
    green: "border-brand-green/20 from-brand-green/10 to-white text-brand-green-dark",
    blue: "border-brand-blue/20 from-brand-blue/10 to-white text-brand-blue",
    amber: "border-amber-200 from-amber-50 to-white text-amber-700",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-r p-4 sm:p-5 ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

function MarketingCard({ item }: { item: MarketingInsight }) {
  return (
    <DashboardPanel className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Product insight</p>
          <h3 className="mt-1 truncate font-heading text-base font-bold text-slate-900">{item.productName}</h3>
        </div>
        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-green shadow-[0_0_8px_rgba(0,195,103,0.8)]" />
      </div>

      <div className="mb-4 rounded-xl border border-brand-green/15 bg-brand-green/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green-dark">Suggested headline</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-slate-800">{item.suggestedHeadline}</p>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Suggested CTA</p>
        <p className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {item.suggestedCta}
        </p>
      </div>

      <ul className="mb-5 space-y-2">
        {item.tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-slate-600">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2">
          <AiApplyToProductButton
            productId={item.productId}
            headline={item.suggestedHeadline}
            tagline={item.tips[0]}
            cta={item.suggestedCta}
          />
          <AiApplyToLandingButton headline={item.suggestedHeadline} tagline={item.tips[0]} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/company/products/${item.productId}/edit`}>
            <Button type="button" size="sm" variant="outline">
              Edit listing
            </Button>
          </Link>
          <Link href={getProductPublicPath(item.productSlug)} target="_blank">
            <Button type="button" size="sm" variant="ghost" className="gap-1.5">
              Preview
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {item.needsAvailability ? (
            <Link href="/company/availability">
              <Button type="button" size="sm" variant="outline" className="gap-1.5 text-amber-700">
                Open availability
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </DashboardPanel>
  );
}

export function CompanyAiIntelligenceHub({
  suggestions,
  marketing,
  audience,
  competitors,
  growth,
}: {
  suggestions: CompanyAiSuggestion[];
  marketing: MarketingInsight[];
  audience: AudienceInsight;
  competitors: CompetitorInsight;
  growth: GrowthInsight;
}) {
  const topScore = growth.productScores[0]?.score ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        <DashboardPanel className="overflow-hidden bg-gradient-to-br from-white via-brand-blue/[0.03] to-brand-green/[0.04] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Genius AI overview</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
                Smarter product growth, tighter lead follow-up
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This workspace turns your live product data, bookings, and visibility into actions you can apply
                directly to listings, landing copy, availability, and follow-up.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-blue/15 bg-white px-3 py-1 text-xs font-semibold text-brand-blue">
                  Product messaging
                </span>
                <span className="rounded-full border border-brand-green/15 bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark">
                  Lead behavior
                </span>
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                  Competitive signals
                </span>
              </div>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[22rem]">
              <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Products with AI</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{marketing.length}</p>
              </div>
              <div className="rounded-2xl border border-brand-green/15 bg-brand-green/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green-dark">Leads analyzed</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{audience.totalLeads}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Top AI score</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{topScore}</p>
              </div>
            </div>
          </div>
        </DashboardPanel>

        <CompanyAiSuggestionsPanel suggestions={suggestions} title="Today's priority actions" compact />
      </div>

      <section className="space-y-3">
        <SectionHeader
          icon={Megaphone}
          title="AI Product Marketing Assistant"
          description="Headlines, CTAs, and optimization tips tied to your live product listings"
          tone="green"
        />
        <div className="grid gap-4">
          {marketing.length === 0 ? (
            <DashboardPanel className="col-span-full border-2 border-dashed p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-brand-blue" />
              <p className="mt-3 font-medium text-slate-900">Publish products to unlock AI marketing insights</p>
              <p className="mt-1 text-sm text-slate-500">
                Once a product is live, Genius AI suggests copy you can apply directly to listings and your company page.
              </p>
              <Link href="/company/products/new" className="mt-4 inline-block">
                <Button>Add your first product</Button>
              </Link>
            </DashboardPanel>
          ) : (
            marketing.map((item) => <MarketingCard key={item.productId} item={item} />)
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-3">
          <SectionHeader
            icon={Users}
            title="AI Audience Intelligence"
            description="Understand who is booking demos and when engagement peaks"
            tone="blue"
          />
          <DashboardPanel className="p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-brand-blue">Insight:</span> {audience.insight}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total leads</p>
                <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{audience.totalLeads}</p>
              </div>
              <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green-dark">Qualified rate</p>
                <p className="mt-1 font-heading text-3xl font-bold text-brand-green">{audience.qualifiedRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top category</p>
                <p className="mt-1 truncate font-heading text-lg font-bold text-slate-900">
                  {audience.topCategories[0]?.[0] ?? "—"}
                </p>
              </div>
            </div>

            {audience.recentLeads.length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent demo requests</p>
                  <Link href="/company/leads" className="text-sm font-semibold text-brand-blue hover:underline">
                    Open lead pipeline
                  </Link>
                </div>
                <ul className="space-y-2">
                  {audience.recentLeads.map((lead) => (
                    <li
                      key={lead.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-800">{lead.name}</span>
                      <span className="text-slate-500">
                        {lead.product} · {lead.status}
                        {lead.preferredTime ? ` · ${lead.preferredTime}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {audience.topBookingTimes.length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Peak booking times</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {audience.topBookingTimes.map((t) => (
                    <li
                      key={t.time}
                      className="rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1.5 text-xs font-semibold text-brand-blue"
                    >
                      {t.time} ({t.count})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </DashboardPanel>
        </div>

        <div className="space-y-3">
          <SectionHeader
            icon={Target}
            title="AI Competitor Analysis"
            description={competitors.summary}
            tone="amber"
          />
          <div className="grid gap-4">
            {competitors.comparisons.length === 0 ? (
              <DashboardPanel className="col-span-full border-2 border-dashed p-6 text-center text-sm text-slate-500">
                Publish products to compare your visibility against category peers.
              </DashboardPanel>
            ) : (
              competitors.comparisons.map((row) => (
                <DashboardPanel key={row.productId} className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-heading font-semibold text-slate-900">{row.productName}</h3>
                      <p className="text-xs text-slate-500">{row.category}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {row.gapPercent !== null ? `${row.gapPercent > 0 ? "+" : ""}${row.gapPercent}%` : "New"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Your views: <strong>{row.yourViews}</strong> · Category avg: <strong>{row.peerAvgViews}</strong>
                  </p>
                  <p className="mt-2 flex-1 text-sm text-brand-blue">{row.recommendation}</p>
                  {row.topPeers.length > 0 ? (
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top peer snapshot</p>
                      <ul className="mt-2 space-y-1.5">
                        {row.topPeers.map((peer) => (
                          <li key={`${row.productId}-${peer.name}`} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate font-medium text-slate-700">{peer.name}</span>
                            <span className="shrink-0 text-slate-500">{peer.views} views</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <Link href={`/company/products/${row.productId}/edit`}>
                      <Button type="button" size="sm" variant="outline">
                        Improve listing
                      </Button>
                    </Link>
                    <Link href="/company/products">
                      <Button type="button" size="sm" variant="ghost">
                        Manage spotlight
                      </Button>
                    </Link>
                  </div>
                </DashboardPanel>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={LineChart}
          title="AI Growth Dashboard"
          description="30-day performance scores across your product catalog"
          tone="blue"
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardPanel className="p-4 text-center">
              <p className="text-xs text-slate-500">Views (30d)</p>
              <p className="mt-1 font-heading text-2xl font-bold">{growth.totalViews30d}</p>
            </DashboardPanel>
            <DashboardPanel className="p-4 text-center">
              <p className="text-xs text-slate-500">Leads (30d)</p>
              <p className="mt-1 font-heading text-2xl font-bold">{growth.totalLeads30d}</p>
            </DashboardPanel>
            <DashboardPanel className="p-4 text-center">
              <p className="text-xs text-slate-500">Top product score</p>
              <p className="mt-1 font-heading text-2xl font-bold">{growth.productScores[0]?.score ?? 0}</p>
            </DashboardPanel>
            <DashboardPanel className="p-4 text-center">
              <p className="text-xs text-slate-500">Products tracked</p>
              <p className="mt-1 font-heading text-2xl font-bold">{growth.productScores.length}</p>
            </DashboardPanel>
          </div>

          <DashboardPanel className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading font-semibold text-slate-900">Product performance scores</h3>
              <Link href="/company/analytics" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                Full analytics
                <BarChart3 className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-2">
              {growth.productScores.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm last:border-0"
                >
                  <Link href={`/company/products/${p.id}/edit`} className="font-medium text-slate-800 hover:text-brand-blue">
                    {p.name}
                  </Link>
                  <span className="text-slate-500">
                    Score {p.score} · {p.views} views · {p.leads} leads
                    {p.vsCategory !== null ? ` · ${p.vsCategory}% vs category` : null}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      </section>
    </div>
  );
}
