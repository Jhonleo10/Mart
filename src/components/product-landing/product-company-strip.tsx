import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, ShieldCheck } from "lucide-react";
import { PlReveal } from "./pl-reveal";
import { getVendorPublicPath } from "@/lib/vendor-public-url";

function shortDescription(text: string | null, max = 140): string {
  if (!text) return "Verified software vendor on Genius Mart.";
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function ProductCompanyStrip({
  company,
}: {
  company: {
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    description: string | null;
  };
}) {
  const profileHref = getVendorPublicPath(company);

  return (
    <section id="landing-company" className="border-y border-slate-200/80 bg-white/60 py-12 backdrop-blur-sm">
      <div className="safe-container">
        <PlReveal>
          <div className="pl-company-card mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left sm:p-8">
            <div className="relative shrink-0">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={72}
                  height={72}
                  className="h-[4.5rem] w-[4.5rem] rounded-2xl border border-slate-100 object-contain p-1 shadow-md"
                />
              ) : (
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--landing-primary)]/15 to-[var(--landing-accent)]/10 text-[var(--landing-primary)]">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Built by</p>
              <h3 className="font-heading mt-1 text-xl font-bold text-slate-900">{company.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {shortDescription(company.description)}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Link
                  href={profileHref}
                  className="pl-btn-ghost inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--landing-primary)]"
                >
                  View vendor profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pl-btn-ghost inline-flex items-center gap-1.5 text-sm font-medium text-slate-500"
                  >
                    Company website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </PlReveal>
      </div>
    </section>
  );
}
