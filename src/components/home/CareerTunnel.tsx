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

      const glow = ctx.createRadialGradient(
        W / 2,
        H * 0.44,
        0,
        W / 2,
        H * 0.44,
        Math.max(W, H) * 0.75,
      );
      glow.addColorStop(0, "rgba(161, 218, 218, 0.08)");
      glow.addColorStop(0.5, "rgba(20, 11, 11, 0)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0.35)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

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
        <span className="hidden md:block">拖动 / 滚动切换</span>
      </div>

      <div className="absolute inset-0 z-10 [perspective:1100px]">
        {entries.map((entry, index) => {
          const position = index - active;
          const depth = Math.max(0, position);
          const isPast = position < 0;
          const isFront = position === 0;
          const hidden = depth > 4;

          return (
            <div
              className="absolute left-1/2 top-1/2 w-[min(64rem,92%)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              key={`${entry.period}-${entry.organization}`}
              style={{
                transform: `translate(-50%, -50%) translateZ(${
                  isPast ? 320 : -depth * 360
                }px)`,
                opacity: isPast || hidden ? 0 : isFront ? 1 : Math.max(0.1, 0.55 - depth * 0.13),
                zIndex: 100 - depth,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <article
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-background/30 p-5 backdrop-blur-[2px] transition-colors md:p-8",
                  isFront
                    ? "border-accent/60 shadow-[0_0_80px_rgba(161,218,218,0.14)]"
                    : "border-foreground/20",
                )}
              >
                <div className="grid gap-6 md:grid-cols-[1.05fr_auto_0.85fr] md:items-center md:gap-8">
                  <div className="order-2 md:order-1">
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="text-accent">[{pad(index + 1)}]</span>
                      <span>
                        {entry.note ? `${entry.kind} · ${entry.note}` : entry.kind}
                      </span>
                    </div>

                    <h3 className="mt-4 whitespace-pre-line font-display text-2xl font-bold leading-snug tracking-[-0.02em] md:text-4xl">
                      <Organization name={entry.organization} />
                    </h3>

                    {entry.role ? (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/75 md:text-base">
                        {entry.role}
                      </p>
                    ) : null}

                    <p className="mt-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                      {entry.range}
                    </p>

                    <p className="mt-4 hidden overflow-hidden text-sm leading-relaxed text-foreground/60 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:block">
                      {entry.detail ??
                        "这段经历的详细介绍待补充：可以写负责的内容、参与的项目，以及这段经历带来的思考。"}
                    </p>
                  </div>

                  <div className="order-1 text-center md:order-2">
                    <p className="font-display text-5xl font-semibold leading-none tracking-[-0.05em] md:text-7xl">
                      {entry.period}
                    </p>
                  </div>

                  <div className="order-3 overflow-hidden rounded-xl border border-border/40">
                    {entry.image ? (
                      <img
                        alt={entry.imageAlt ?? entry.organization}
                        className="aspect-[4/3] w-full object-cover"
                        decoding="async"
                        loading="lazy"
                        src={entry.image}
                      />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-card/60 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                        图片待补充
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 pb-3 text-center">
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground/70">
          拖动 / 滚动切换
        </span>
      </div>
    </div>
  );
};
