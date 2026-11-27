import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Study {
  index: string;
  title: string;
  medium: string;
  timecode: string;
  imageSrc: string;
  imageAlt: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

export const StudyDeck = ({ studies }: { studies: Study[] }) => {
  const [active, setActive] = useState(0);
  const total = studies.length;
  const current = studies[active] ?? studies[0];

  if (!current) return null;

  const go = (index: number) =>
    setActive(Math.min(total - 1, Math.max(0, index)));

  return (
    <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col lg:col-span-5">
        <p className="font-display text-4xl font-medium leading-none tracking-[-0.04em]">
          {pad(active + 1)}
          <span className="ml-3 align-top font-mono text-xs tracking-[0.16em] text-muted-foreground">
            / {pad(total)}
          </span>
        </p>
        <p aria-live="polite" className="sr-only">
          {`${active + 1} of ${total}: ${current.title}`}
        </p>

        <ul className="mt-20 space-y-6 md:mt-32">
          {studies.map((study, index) => {
            const isActive = index === active;
            return (
              <li key={study.index}>
                <button
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "block text-left font-display transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
                    isActive
                      ? "text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground md:text-5xl"
                      : "text-lg font-medium leading-tight tracking-[-0.02em] text-muted-foreground hover:text-foreground md:text-2xl",
                  )}
                  onClick={() => setActive(index)}
                  type="button"
                >
                  {study.title}
                </button>

                <div
                  aria-hidden={!isActive}
                  className={cn(
                    "grid transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
                      {study.imageAlt}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {study.medium} · {study.timecode}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <div className="relative aspect-[10/7] w-full">
          {studies.map((study, index) => {
            const position = index - active;
            const isFront = position === 0;
            const isPast = position < 0;
            const depth = Math.max(0, position);
            return (
              <div
                className="absolute inset-y-0 left-0 w-[64%] overflow-hidden rounded-xl bg-card transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                key={study.index}
                style={{
                  zIndex: total - Math.abs(position),
                  transform: isPast
                    ? "translate(-12%, 10px) scale(0.94)"
                    : `translate(${depth * 24}%, ${depth * 10}px) scale(${1 - depth * 0.06})`,
                  opacity: isPast ? 0 : isFront ? 1 : Math.max(0.26, 0.8 - depth * 0.22),
                  pointerEvents: isFront ? "auto" : "none",
                }}
              >
                <img
                  alt={study.imageAlt}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  decoding="async"
                  loading="lazy"
                  src={study.imageSrc}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-6">
          <div className="flex w-[16rem] max-w-full items-center gap-1.5">
            {studies.map((study, index) => (
              <button
                aria-current={index === active ? "true" : undefined}
                aria-label={`第 ${index + 1} 个作品：${study.title}`}
                className="group flex h-4 flex-1 items-center"
                key={study.index}
                onClick={() => setActive(index)}
                type="button"
              >
                <span
                  className={cn(
                    "h-[2px] w-full rounded-full transition-colors",
                    index === active
                      ? "bg-foreground"
                      : "bg-border group-hover:bg-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="上一个作品"
              className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
              disabled={active === 0}
              onClick={() => go(active - 1)}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              aria-label="下一个作品"
              className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
              disabled={active === total - 1}
              onClick={() => go(active + 1)}
              type="button"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
