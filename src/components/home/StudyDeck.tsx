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

const VISIBLE_DEPTH = 4;
const DECK_SIZE = 6;

export const StudyDeck = ({ studies }: { studies: Study[] }) => {
  const [active, setActive] = useState(0);

  const placeholderCount = Math.max(0, DECK_SIZE - studies.length);
  const placeholders: Study[] = Array.from(
    { length: placeholderCount },
    (_, index) => ({
      index: `P-${index + 1}`,
      title: `待补充 ${pad(studies.length + index + 1)}`,
      medium: "Placeholder",
      timecode: "—",
      imageSrc: "",
      imageAlt: "这件作品的介绍待补充。",
    }),
  );

  const items = [...studies, ...placeholders];
  const total = items.length;
  const current = items[Math.min(active, total - 1)] ?? items[0];

  if (!current) return null;

  const go = (index: number) =>
    setActive(((index % total) + total) % total);

  return (
    <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col lg:col-span-4">
        <p className="font-mono text-4xl font-medium leading-none tracking-[-0.02em]">
          {pad(active + 1)}
          <span className="ml-3 align-top font-mono text-xs tracking-[0.16em] text-muted-foreground">
            / {pad(total)}
          </span>
        </p>
        <p aria-live="polite" className="sr-only">
          {`${active + 1} of ${total}: ${current.title}`}
        </p>

        <ul className="mt-20 space-y-6 md:mt-32">
          {items.map((study, index) => {
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
                    isActive
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
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

      <div className="min-w-0 lg:col-span-8">
        <div className="relative aspect-[10/7] w-full">
          {items.map((study, index) => {
            const offset = (index - active + total) % total;
            const isFront = offset === 0;
            const hidden = offset > VISIBLE_DEPTH;

            return (
              <div
                className="absolute inset-y-0 left-0 w-[55%] origin-top overflow-hidden bg-foreground transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                key={study.index}
                style={{
                  zIndex: total - offset,
                  transform: hidden
                    ? "translate(-20%) scale(0.94)"
                    : `translate(${offset * 27}%, ${offset * 6}px) scale(${Math.pow(0.8, offset)}) rotate(${offset * 1.2}deg)`,
                  opacity: hidden ? 0 : isFront ? 1 : Math.max(0.2, 0.95 - offset * 0.18),
                  pointerEvents: isFront ? "auto" : "none",
                }}
              >
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            aria-label="上一个作品"
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
            onClick={() => go(active - 1)}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            aria-label="下一个作品"
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-30"
            onClick={() => go(active + 1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
