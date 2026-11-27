import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
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

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
    }));

    const observer = new IntersectionObserver(
      records => {
        visible = records.some(record => record.isIntersecting);
      },
      { rootMargin: "200px" },
    );
    observer.observe(canvas);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      if (!visible) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      for (const star of stars) {
        const twinkle = reduceMotion
          ? 0.5
          : 0.18 + 0.55 * Math.abs(Math.sin(now * 0.0006 * star.speed + star.phase));
        ctx.fillStyle = `rgba(242, 237, 227, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />;
};

export const CareerTunnel = ({ entries }: { entries: CareerEntry[] }) => {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ id: number; x: number; dx: number } | null>(null);
  const wheelRef = useRef(0);

  const total = entries.length;
  const current = entries[active];

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
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (Math.abs(delta) < 10) return;
    const now = Date.now();
    if (now - wheelRef.current < 500) return;
    wheelRef.current = now;
    go(delta > 0 ? active + 1 : active - 1);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  };

  if (!current) return null;

  return (
    <div
      aria-label="学习与工作经历 3D 时间隧道，可拖动或滚动切换"
      aria-roledescription="carousel"
      className={cn(
        "relative mt-12 h-[76vh] min-h-[580px] w-full touch-pan-y select-none overflow-hidden bg-background md:mt-16",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onKeyDown={handleKeyDown}
      onPointerCancel={endDrag}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onWheel={handleWheel}
      role="group"
      tabIndex={0}
    >
      <StarField />
      <p aria-live="polite" className="sr-only">
        {`${active + 1} of ${total}: ${current.organization}`}
      </p>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground md:p-8">
        <span>
          {pad(active + 1)} <span className="text-muted-foreground/60">/ {pad(total)}</span>
        </span>
      </div>

      <div className="absolute inset-0 z-10 [perspective:1600px]">
        {entries.map((entry, index) => {
          const position = index - active;
          const depth = Math.max(0, position);
          const isPast = position < 0;
          const isFront = position === 0;
          const hidden = depth > 4;
          const contentRight = index % 2 === 1;

          return (
            <div
              className="absolute left-1/2 top-1/2 h-[min(54vh,500px)] min-h-[380px] w-[min(46rem,88%)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              key={`${entry.period}-${entry.organization}`}
              style={{
                transform: isPast
                  ? "translate(-50%, -50%) rotateY(0deg) scale(1.05)"
                  : `translate(-50%, -50%) rotateY(${
                      contentRight ? -8 : 8
                    }deg) scale(${Math.pow(0.72, depth)})`,
                opacity: isPast || hidden ? 0 : isFront ? 1 : Math.max(0.08, 0.5 - depth * 0.12),
                zIndex: 100 - depth,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <article
                className={cn(
                  "absolute inset-0 border transition-colors",
                  isFront
                    ? "border-accent/70"
                    : "border-foreground/18",
                )}
              >
                <div
                  className={cn(
                    "absolute top-[9%] w-[58%] md:top-1/2 md:w-[34%] md:-translate-y-1/2",
                    contentRight
                      ? "right-[5%] text-right md:right-[6%]"
                      : "left-[5%] text-left md:left-[6%]",
                  )}
                >
                  {entry.image ? (
                    <img
                      alt={entry.imageAlt ?? entry.organization}
                      className="aspect-[16/9] w-full border border-border/40 object-cover"
                      decoding="async"
                      loading="lazy"
                      src={entry.image}
                    />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center border border-border/40 bg-card/60 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                      图片待补充
                    </div>
                  )}

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="text-accent">[{pad(index + 1)}]</span>{" "}
                    {entry.note ? `${entry.kind} · ${entry.note}` : entry.kind}
                  </p>

                  <h3 className="mt-1.5 whitespace-pre-line font-display text-lg font-bold leading-tight tracking-[-0.02em] md:text-2xl">
                    <Organization name={entry.organization} />
                  </h3>

                  {entry.role ? (
                    <p className="mt-1 text-xs leading-relaxed text-foreground/70 md:text-sm">
                      {entry.role}
                    </p>
                  ) : null}

                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
                    {entry.range}
                  </p>
                </div>

                <p className="absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xl font-semibold leading-none tracking-[-0.05em] md:text-4xl">
                  {entry.period}
                </p>
              </article>
            </div>
          );
        })}
      </div>

    </div>
  );
};
