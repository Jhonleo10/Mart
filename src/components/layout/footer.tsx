import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { getSiteConfig } from "@/lib/site-config";
import { SiteBrandName } from "@/components/brand/site-brand-name";
import { landingHref, LANDING_SECTIONS } from "@/lib/landing";
import { Mail, Globe, ExternalLink, Heart } from "lucide-react";

const QUICK_LINKS = LANDING_SECTIONS.filter((s) => s.id !== "hero");

const PRODUCT_LINKS = [
    { label: "Browse Software", href: "/products" },
    { label: "All Products", href: "/products" },
    { label: "Compare Solutions", href: "/products" },
    { label: "Book a Demo", href: "/products" },
];

const COMPANY_LINKS = [
    { label: "About Us", href: landingHref("about") },
    { label: "Become a Seller", href: "/seller/register" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Privacy Policy", href: "/privacy-policy" },
];

const SOCIAL_LINKS = [
    { icon: Globe, href: BRAND.social.twitter, label: "Twitter" },
    { icon: ExternalLink, href: BRAND.social.linkedin, label: "LinkedIn" },
    { icon: Heart, href: BRAND.social.instagram, label: "Instagram" },
];

export async function Footer() {
    const site = await getSiteConfig();

    return (
        <footer className="border-t border-slate-200 bg-slate-50">
            <div className="safe-container py-12 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-8">
                    {/* Brand column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                                <Image
                                    src={BRAND.logoSrc}
                                    alt={site.logoAlt}
                                    width={36}
                                    height={36}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <span className="font-heading text-base font-bold text-slate-900">
                                <SiteBrandName name={site.name} />
                            </span>
                        </Link>

                        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                            {site.description}
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <a
                                href={`mailto:${site.contactEmail}`}
                                className="text-sm text-slate-500 transition-colors hover:text-brand-blue"
                            >
                                {site.contactEmail}
                            </a>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-md"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Navigate
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                >
                                    Home
                                </Link>
                            </li>
                            {QUICK_LINKS.map((link) => (
                                <li key={link.id}>
                                    <Link
                                        href={landingHref(link.id)}
                                        className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Marketplace
                        </h3>
                        <ul className="space-y-2.5">
                            {PRODUCT_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {COMPANY_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/login"
                                    className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                >
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/register"
                                    className="text-sm text-slate-600 transition-colors hover:text-brand-blue"
                                >
                                    Register as Buyer
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/seller/register"
                                    className="text-sm text-slate-600 transition-colors hover:text-brand-green"
                                >
                                    Seller Registration
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 sm:flex-row">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/privacy-policy"
                            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
