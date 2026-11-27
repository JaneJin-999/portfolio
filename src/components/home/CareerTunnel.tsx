import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const total = entries.length;
  const current = entries[active];

  const go = (index: number) => setActive(((index % total) + total) % total);

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
      aria-label="学习与工作经历 3D 时间隧道，点击切换"
      aria-roledescription="carousel"
      className="relative mt-12 h-[76vh] min-h-[580px] w-full cursor-pointer select-none overflow-hidden bg-background md:mt-16"
      onClick={() => go(active + 1)}
      onKeyDown={handleKeyDown}
      role="group"
      tabIndex={0}
    >
      <StarField />
      <p aria-live="polite" className="sr-only">
        {`${active + 1} of ${total}: ${current.organization}`}
      </p>

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
              className="absolute left-1/2 top-1/2 h-[min(58vh,540px)] min-h-[420px] w-full transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              key={`${entry.period}-${entry.organization}`}
              style={{
                transform: isPast
                  ? "translate(-50%, -50%) rotateY(0deg) scale(1.05)"
                  : `translate(-50%, -50%) rotateY(${
                      narrow ? 0 : contentRight ? -8 : 8
                    }deg) scale(${Math.pow(0.68, depth)})`,
                opacity:
                  isPast || hidden
                    ? 0
                    : isFront
                      ? 1
                      : narrow
                        ? 0
                        : Math.max(0.08, 0.5 - depth * 0.12),
                zIndex: 100 - depth,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <article className="absolute inset-0">
                <div
                  className={
                    narrow
                      ? "absolute left-0 top-[6%] w-[64%] text-left"
                      : cn(
                          "absolute top-[9%] w-[58%] md:top-1/2 md:w-[28%] md:-translate-y-1/2",
                          contentRight
                            ? "right-[2.5%] text-right"
                            : "left-[2.5%] text-left",
                        )
                  }
                >
                  {entry.image ? (
                    <img
                      alt={entry.imageAlt ?? entry.organization}
                      className="aspect-square w-full object-cover"
                      decoding="async"
                      loading="lazy"
                      src={entry.image}
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-card/60 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                      图片待补充
                    </div>
                  )}

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="text-accent">[{pad(index + 1)}]</span>{" "}
                    <span className="text-[11px]">
                      {entry.note ? `${entry.kind} · ${entry.note}` : entry.kind}
                    </span>
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

                  <p className="mt-3 hidden overflow-hidden text-xs leading-relaxed text-foreground/60 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:block">
                    {entry.detail ??
                      "这段经历的详细介绍待补充：可以写负责的内容、参与的项目，以及这段经历带来的思考。"}
                  </p>
                </div>

                {!narrow ? (
                  <p className="absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xl font-semibold leading-none tracking-[-0.05em] md:text-4xl">
                    {entry.period}
                  </p>
                ) : null}
              </article>
            </div>
          );
        })}
      </div>

    </div>
  );
};
