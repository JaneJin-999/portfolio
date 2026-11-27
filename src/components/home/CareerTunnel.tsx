import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { cn } from "@/lib/utils";
import type { CareerEntry } from "@/components/home/CareerTimeline";

const pad = (value: number) => String(value).padStart(2, "0");

const Organization = ({ name }: { name: string }) => {
  const suffix = "有限公司";
  const index = name.lastIndexOf(suffix);
  if (index <= 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, index)}
      <span className="whitespace-nowrap">{suffix}</span>
    </>
  );
};

export const CareerTunnel = ({ entries }: { entries: CareerEntry[] }) => {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ id: number; x: number; dx: number } | null>(null);
  const wheelRef = useRef(0);

  const total = entries.length;
  const current = entries[active];
  if (!current) return null;

  const go = (index: number) => setActive(((index % total) + total) % total);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { id: event.pointerId, x: event.clientX, dx: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    drag.dx = event.clientX - drag.x;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    if (event.type === "pointercancel") return;
    if (drag.dx <= -30) go(active + 1);
    else if (drag.dx >= 30) go(active - 1);
    else if (Math.abs(drag.dx) < 6) go(active + 1);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (Math.abs(delta) < 10) return;
    const now = Date.now();
    if (now - wheelRef.current < 500) return;
    wheelRef.current = now;
    go(delta > 0 ? active + 1 : active - 1);
  };

  return (
    <div
      aria-label="学习与工作经历 3D 时间隧道，可拖动或滚动切换"
      aria-roledescription="carousel"
      className={cn(
        "relative mt-12 h-[560px] w-full touch-pan-y select-none overflow-hidden md:mt-16 md:h-[640px]",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerCancel={endDrag}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onWheel={handleWheel}
      onKeyDown={event => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(active + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(active - 1);
        }
      }}
      role="group"
      tabIndex={0}
    >
      <p aria-live="polite" className="sr-only">
        {`${active + 1} of ${total}: ${current.organization}`}
      </p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(161,218,218,0.06), transparent 65%)",
        }}
      />

      <div className="absolute inset-0 [perspective:1200px]">
        {entries.map((entry, index) => {
          const position = index - active;
          const depth = Math.max(0, position);
          const isPast = position < 0;
          const isFront = position === 0;
          const hidden = depth > 4;

          return (
            <div
              className="absolute left-1/2 top-1/2 w-[min(44rem,88%)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              key={`${entry.period}-${entry.organization}`}
              style={{
                transform: `translate(-50%, -50%) translateZ(${
                  isPast ? 420 : -depth * 300
                }px)`,
                opacity: isPast || hidden ? 0 : isFront ? 1 : Math.max(0.1, 0.62 - depth * 0.14),
                zIndex: 100 - depth,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <article
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-background/35 p-6 backdrop-blur-sm md:p-10",
                  isFront ? "border-accent/50" : "border-foreground/20",
                )}
              >
                {entry.image ? (
                  <>
                    <img
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover opacity-25"
                      decoding="async"
                      loading="lazy"
                      src={entry.image}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/55 to-background/25"
                    />
                  </>
                ) : null}

                <div className="relative">
                  <p className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] md:text-6xl">
                    {entry.period}
                  </p>

                  <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="text-accent">[{pad(index + 1)}]</span>
                    <span>
                      {entry.note
                        ? `${entry.kind} · ${entry.note}`
                        : entry.kind}
                    </span>
                  </div>

                  <h3 className="mt-4 whitespace-pre-line font-display text-2xl font-bold leading-snug tracking-[-0.02em] md:text-4xl">
                    <Organization name={entry.organization} />
                  </h3>

                  {entry.role ? (
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80 md:text-base">
                      {entry.role}
                    </p>
                  ) : null}

                  <p className="mt-4 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                    {entry.range}
                  </p>

                  <p className="mt-5 overflow-hidden text-sm leading-relaxed text-foreground/70 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                    {entry.detail ??
                      "这段经历的详细介绍待补充：可以写负责的内容、参与的项目，以及这段经历带来的思考。"}
                  </p>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-1.5 text-center">
        <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">
          {pad(active + 1)} / {pad(total)}
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground/70">
          拖动 / 滚动切换
        </span>
      </div>
    </div>
  );
};
