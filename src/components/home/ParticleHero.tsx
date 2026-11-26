import { useState } from "react";
import { HeroIntro } from "@/components/home/HeroIntro";
import { ParticleField } from "@/components/home/ParticleField";

const navItems = [{
  label: "Studies",
  href: "#studies"
}, {
  label: "Process",
  href: "#process"
}, {
  label: "Screenings",
  href: "#screenings"
}];

export const ParticleHero = () => {
  const [showIntro, setShowIntro] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-white text-neutral-950" aria-label="Interactive particle study: an open ring of black particles with an empty centre that rotates with the pointer">
      <ParticleField interactive={!showIntro} className="absolute inset-0 h-full w-full cursor-crosshair" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col px-5 py-5 md:px-8 md:py-7">
        <nav className="pointer-events-auto flex items-center justify-between gap-5 border-b border-black/20 pb-5">
          <a href="#manifesto" className="font-display text-lg font-semibold uppercase tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white">
            JINJIN
          </a>
          <div className="ml-auto flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] sm:gap-7 sm:text-xs">
            {navItems.map(item => <a key={item.href} href={item.href} className="transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white">
                {item.label}
              </a>)}
          </div>
        </nav>

        <div className="flex-1" />

        <p className="absolute right-5 top-[47.7%] -translate-y-1/2 select-none whitespace-nowrap text-right font-display font-semibold leading-[0.85] tracking-[-0.04em] text-neutral-950 md:right-8" style={{
          fontSize: "clamp(2rem, min(10.5vw, 20vh), 13rem)"
        }}>
          JIN's<br />PORTFOLIO
        </p>

        <div className="flex flex-col gap-6 border-t border-black/20 pt-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              UI/UX DESIGN
            </p>
            <h1
              className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold uppercase leading-[0.84]"
              style={{ letterSpacing: "calc(-0.06em + 1px)" }}
            >
              2027
            </h1>
          </div>
        </div>
      </div>

      {showIntro ? <HeroIntro onComplete={() => setShowIntro(false)} /> : null}
    </section>
  );
};
