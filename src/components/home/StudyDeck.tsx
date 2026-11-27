import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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
  const [dragX, setDragX] = useState(0);
  const [deckDragging, setDeckDragging] = useState(false);
  const deckDragRef = useRef<{ id: number; x: number; dx: number } | null>(null);

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

  const startDeckDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    deckDragRef.current = { id: event.pointerId, x: event.clientX, dx: 0 };
    setDeckDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDeckDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = deckDragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = Math.max(-160, Math.min(160, event.clientX - drag.x));
    drag.dx = dx;
    setDragX(dx);
  };

  const endDeckDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = deckDragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    deckDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDeckDragging(false);
    setDragX(0);
    if (drag.dx <= -40) go(active + 1);
    else if (drag.dx >= 40) go(active - 1);
  };

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
        <div
          aria-label="作品轮播，可左右拖动切换"
          aria-roledescription="carousel"
          className={cn(
            "relative aspect-[10/7] w-full touch-pan-y select-none",
            deckDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onPointerCancel={endDeckDrag}
          onPointerDown={startDeckDrag}
          onPointerMove={moveDeckDrag}
          onPointerUp={endDeckDrag}
          role="group"
        >
          <div
            className={cn(
              "relative h-full w-full",
              !deckDragging &&
                "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{ transform: `translateX(${dragX}px)` }}
          >
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
                    : `perspective(1200px) translate(${offset * 27}%, ${offset * 6}px) scale(${Math.pow(0.8, offset)}) rotateY(${offset === 0 ? 0 : 4}deg)`,
                  opacity: hidden ? 0 : isFront ? 1 : Math.max(0.2, 0.95 - offset * 0.18),
                  pointerEvents: isFront ? "auto" : "none",
                }}
              >
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};
