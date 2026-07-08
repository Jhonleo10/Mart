import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { AppToaster } from "@/components/layout/app-toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConditionalFooter, ConditionalHeader } from "@/components/layout/conditional-chrome";
import { getSiteConfig } from "@/lib/site-config";
import "./globals.css";

const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: {
      default: `${site.name} | Software Discovery Marketplace`,
      template: `%s | ${site.name}`,
    },
    description:
      "Discover, compare, and book demos for verified SaaS products. List your software and grow leads on India's trusted B2B marketplace.",
    keywords: ["software marketplace", "SaaS discovery", "B2B software", "CRM", "ERP", "demo booking"],
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full overflow-x-clip`}>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-sans antialiased">
        <ConditionalHeader>
          <Header />
        </ConditionalHeader>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        <ConditionalFooter>
          <Footer />
        </ConditionalFooter>
        <AppToaster />
      </body>
    </html>
  );
}
