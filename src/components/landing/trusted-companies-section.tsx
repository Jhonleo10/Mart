import Image from "next/image";
import { cn } from "@/lib/utils";

export function TrustedCompaniesSection({
  companies,
}: {
  companies: { name: string; logo: string | null; industry: string | null }[];
}) {
  if (companies.length === 0) return null;

  // Duplicate companies several times to guarantee the infinite scroll fills wide monitors effortlessly
  const list = [...companies, ...companies, ...companies, ...companies];
  const shapes = [
    "rounded-[2rem] sm:rounded-[2.5rem]",
    "rounded-[1.75rem] rounded-tr-[0.75rem] sm:rounded-[2.25rem] sm:rounded-tr-[1rem]",
    "rounded-[1.75rem] rounded-bl-[0.75rem] sm:rounded-[2.25rem] sm:rounded-bl-[1rem]",
    "rounded-[1.5rem] sm:rounded-[2rem]",
  ];
  const accents = [
    "from-brand-blue/15 via-white to-brand-green/10",
    "from-violet-100 via-white to-brand-blue/10",
    "from-emerald-100 via-white to-brand-green/10",
    "from-sky-100 via-white to-slate-100",
  ];

  return (
    <section
      id="companies"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f6fbf8_48%,#f8fafc_100%)] py-16 sm:py-24 lg:py-28"
    >

      {/* Inline Keyframes for the Infinite Marquee */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes infinite-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-marquee {
          animation: infinite-marquee 40s linear infinite;
        }
      `}} />

      {/* Decorative ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-blue/5 via-brand-green/5 to-brand-blue/5 blur-[120px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_70%)]" />

      <div className="mb-12 flex flex-col items-center px-4 text-center sm:mb-14">
        <div className="inline-flex max-w-full cursor-default items-center gap-3 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2.5 text-center shadow-[0_4px_24px_rgba(37,99,235,0.06)] backdrop-blur-md transition-all duration-500 hover:scale-105 sm:px-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-80"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue"></span>
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600 sm:text-[11px]">
            Trusted software vendors on our platform
          </p>
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-80"
              style={{ animationDelay: "600ms" }}
            ></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-blue"></span>
          </span>
        </div>
        <h2 className="mt-5 max-w-4xl font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Discover the <span className="text-gradient"> SaaS brands</span> trusted by serious buyers
        </h2>
        <div className="mt-4 max-w-2xl">
          <p className="text-sm leading-6 text-slate-500 sm:text-base">
            A curated ribbon of verified vendors, premium product makers, and standout software companies presented
            with a more elevated visual system.
          </p>
        </div>
      </div>

      {/* Full Bleed Slideshow Wrapper */}
      <div className="relative flex w-full overflow-hidden px-1 sm:px-0">

        {/* Seamless edge masks (solid color matching section bg to transparent) */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-[#f8fbff] to-transparent sm:w-24 lg:w-40" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-[#f8fafc] to-transparent sm:w-24 lg:w-40" />

        {/* Marquee Track container */}
        <div className="flex w-max animate-infinite-marquee hover:[animation-play-state:paused]">

          {/* We render exactly 2 sets so taking it to -50% perfectly loops it */}
          {[1, 2].map((set) => (
            <div key={set} className="flex gap-4 px-2 sm:gap-6 sm:px-3 lg:gap-8 lg:px-4">
              {list.map((c, i) => (
                <div
                  key={`${set}-${c.name}-${i}`}
                  className="group relative flex cursor-pointer flex-col items-center justify-start py-2 transition-all duration-500"
                >
                  <div
                    className={cn(
                      "relative flex h-[7.25rem] w-[10.5rem] items-center justify-center overflow-hidden border border-slate-200/70 bg-gradient-to-br p-0 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-2 group-hover:border-brand-blue/30 group-hover:shadow-[0_20px_50px_-12px_rgba(0,118,223,0.2)] sm:h-[8.5rem] sm:w-[13.5rem] lg:h-[9rem] lg:w-[15.5rem]",
                      accents[i % accents.length],
                      shapes[i % shapes.length],
                    )}
                  >
                    <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-white/96" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,118,223,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(0,195,103,0.08),transparent_36%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                    {c.logo ? (
                      <div className="relative z-[1] h-full w-full px-3 py-3 sm:px-4 sm:py-4">
                        <Image
                          src={c.logo}
                          alt={c.name}
                          fill
                          sizes="(max-width: 640px) 168px, (max-width: 1024px) 216px, 248px"
                          className="object-contain p-3 sm:p-4"
                        />
                      </div>
                    ) : (
                      <div className="relative z-[1] flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 transition-colors duration-500 group-hover:from-brand-blue/10 group-hover:to-brand-green/10">
                        <span className="px-4 text-center font-heading text-lg font-black text-slate-400 drop-shadow-sm transition-colors duration-500 group-hover:text-brand-blue group-hover:drop-shadow-md sm:text-2xl">
                          {c.name}
                        </span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[2]">
                      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/88 px-3 py-1.5 shadow-lg shadow-slate-200/60 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                        <span className="truncate text-[11px] font-bold tracking-wide text-slate-700">
                          {c.industry ?? c.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full max-w-[10.5rem] text-center sm:max-w-[13.5rem] lg:max-w-[15.5rem]">
                    <p className="truncate font-heading text-sm font-bold text-slate-900 sm:text-[15px]">{c.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
