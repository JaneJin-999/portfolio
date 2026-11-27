import { useState } from "react";
import { HeroIntro } from "@/components/home/HeroIntro";
import { ParticleField } from "@/components/home/ParticleField";

const navItems = [{
  label: "背景",
  href: "#process"
}, {
  label: "作品",
  href: "#studies"
}, {
  label: "联系我",
  href: "#contact"
}];

export const ParticleHero = () => {
  const [showIntro, setShowIntro] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <section className="on-light relative h-[100svh] w-full overflow-hidden bg-[#F2EDE3] text-neutral-950" aria-label="Interactive particle study: an open ring of black particles with an empty centre that rotates with the pointer">
      <ParticleField interactive={!showIntro} className="absolute inset-0 h-full w-full cursor-crosshair" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col px-10 py-5 md:px-8 md:py-7">
        <nav className="pointer-events-auto mx-auto flex w-full max-w-[1600px] items-center justify-between gap-5 border-b border-black/20 pb-5">
          <a href="#manifesto" className="font-display text-lg font-semibold uppercase tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-[#F2EDE3]">
            JINJIN
          </a>
          <div className="ml-auto flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] sm:gap-7 sm:text-xs">
            {navItems.map(item => <a key={item.href} href={item.href} className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-[#F2EDE3]">
                {item.label}
              </a>)}
          </div>
        </nav>

        <div className="flex-1" />

        <div className="pointer-events-none absolute inset-x-0 top-[47.7%] px-10 md:px-8">
          <div className="mx-auto flex max-w-[1600px] -translate-y-1/2 justify-end">
            <p className="select-none whitespace-nowrap text-right font-display font-semibold leading-[0.85] tracking-[-0.04em] text-neutral-950" style={{
              fontSize: "clamp(2rem, min(10.5vw, 20vh), 13rem)"
            }}>
              JIN's<br />PORTFOLIO
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 border-t border-black/20 pt-5 md:flex-row md:items-end md:justify-between">
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
