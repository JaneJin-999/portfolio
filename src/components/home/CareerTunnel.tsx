import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { CareerEntry } from "@/components/home/CareerTimeline";

const pad = (value: number) => String(value).padStart(2, "0");

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

const drawCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
};

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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(0);
  const burstRef = useRef(0);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const dragRef = useRef<{ id: number; x: number; dx: number } | null>(null);
  const wheelRef = useRef(0);

  const total = entries.length;
  const current = entries[active];

  const go = (index: number) => setActive(((index % total) + total) % total);

  useEffect(() => {
    activeRef.current = active;
    burstRef.current = 4.5;
  }, [active]);

  useEffect(() => {
    entries.forEach((entry, index) => {
      if (!entry.image) return;
      const image = new Image();
      image.decoding = "async";
      image.src = entry.image;
      imagesRef.current.set(index, image);
    });
  }, [entries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let travel = 0;
    let last = performance.now();

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
    }));

    const observer = new IntersectionObserver(
      records => {
        visible = records.some(record => record.isIntersecting);
      },
      { rootMargin: "300px" },
    );
    observer.observe(stage);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawFrame = (
      cx: number,
      cy: number,
      floor: number,
      w: number,
      h: number,
      alpha: number,
      scale: number,
      tilt: number,
    ) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      roundedRect(ctx, -w / 2, -h / 2, w, h, Math.max(4, 18 * scale));
      ctx.strokeStyle = `rgba(161, 218, 218, ${alpha})`;
      ctx.lineWidth = Math.max(0.6, 1.6 * scale);
      if (scale > 0.28) {
        ctx.shadowColor = `rgba(161, 218, 218, ${alpha * 0.9})`;
        ctx.shadowBlur = 16;
      }
      ctx.stroke();
      ctx.restore();

      // floor reflection
      if (scale < 1.35) {
        ctx.save();
        ctx.translate(cx, 2 * floor - cy);
        ctx.rotate(-tilt);
        roundedRect(ctx, -w / 2, -h / 2, w, h, Math.max(4, 18 * scale));
        ctx.strokeStyle = `rgba(161, 218, 218, ${alpha * 0.16})`;
        ctx.lineWidth = Math.max(0.5, 1.1 * scale);
        ctx.stroke();
        ctx.restore();
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!visible) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const rect = stage.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (canvas.width !== Math.round(W * Math.min(window.devicePixelRatio || 1, 2))) {
        resize();
      }

      const speedBase = reduceMotion ? 0 : 0.35;
      burstRef.current += (0 - burstRef.current) * Math.min(1, dt * 2.4);
      const speed = speedBase + burstRef.current;
      travel += dt * speed;

      const cx = W / 2;
      const cy = H * 0.42;
      const floor = H * 0.94;

      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#1b0f0e");
      bg.addColorStop(0.55, "#140b0b");
      bg.addColorStop(1, "#070304");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // stars
      for (const star of stars) {
        const twinkle = 0.25 + 0.55 * Math.abs(Math.sin(travel * star.speed + star.phase));
        ctx.fillStyle = `rgba(242, 237, 227, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // corridor
      const spacing = 13;
      const count = 12;
      for (let i = 0; i < count; i += 1) {
        const raw = (i - travel) % spacing;
        const z = ((raw % spacing) + spacing) % spacing;
        if (z < 0.55) continue;
        const scale = 1.15 / (z + 0.35);
        const w = W * 1.5 * scale;
        const h = w * 0.56;
        const alpha = Math.max(0.025, 0.82 - z * 0.062);
        drawFrame(cx, cy, floor, w, h, alpha, scale, -0.03);
      }

      // central portal with the active image
      const pw = Math.min(W * 0.58, 660);
      const ph = pw * 0.64;
      const px = W / 2 - pw / 2;
      const py = H * 0.42 - ph / 2;
      const image = imagesRef.current.get(activeRef.current);

      ctx.save();
      roundedRect(ctx, px, py, pw, ph, 18);
      ctx.fillStyle = "rgba(20, 11, 11, 0.72)";
      ctx.fill();
      if (image?.complete && image.naturalWidth) {
        ctx.save();
        roundedRect(ctx, px, py, pw, ph, 18);
        ctx.clip();
        drawCover(ctx, image, px, py, pw, ph);
        const shade = ctx.createLinearGradient(0, py, 0, py + ph);
        shade.addColorStop(0.35, "rgba(20, 11, 11, 0.15)");
        shade.addColorStop(1, "rgba(20, 11, 11, 0.9)");
        ctx.fillStyle = shade;
        ctx.fillRect(px, py, pw, ph);
        ctx.restore();
      }
      roundedRect(ctx, px, py, pw, ph, 18);
      ctx.strokeStyle = "rgba(242, 237, 227, 0.7)";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "rgba(161, 218, 218, 0.6)";
      ctx.shadowBlur = 24;
      ctx.stroke();
      ctx.restore();

      // year inside the portal
      const yearFont = Math.round(Math.min(96, pw * 0.14));
      ctx.save();
      ctx.font = `600 ${yearFont}px Montserrat, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = "rgba(242, 237, 227, 0.95)";
      ctx.shadowColor = "rgba(161, 218, 218, 0.45)";
      ctx.shadowBlur = 28;
      ctx.textBaseline = "alphabetic";
      const yearBase = py + ph - Math.max(24, ph * 0.08);
      ctx.fillText(entries[activeRef.current]?.period ?? "", px + pw * 0.06, yearBase);

      // upcoming years stacked upward, receding into the frame
      ctx.shadowBlur = 0;
      for (let step = 3; step >= 1; step -= 1) {
        const label = entries[(activeRef.current + step) % entries.length]?.period;
        if (!label) continue;
        const size = Math.round(yearFont * (1 - step * 0.2));
        ctx.font = `500 ${size}px Montserrat, "Helvetica Neue", sans-serif`;
        ctx.fillStyle = `rgba(242, 237, 227, ${Math.max(0.12, 0.5 - step * 0.1)})`;
        ctx.fillText(label, px + pw * 0.06, yearBase - yearFont * step * 0.62);
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [entries]);

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
        "relative mt-12 h-[70vh] min-h-[540px] w-full touch-pan-y select-none overflow-hidden md:mt-16 md:max-h-[760px]",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onKeyDown={handleKeyDown}
      onPointerCancel={endDrag}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onWheel={handleWheel}
      ref={stageRef}
      role="group"
      tabIndex={0}
    >
      <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
      <p aria-live="polite" className="sr-only">
        {`${active + 1} of ${total}: ${current.organization}`}
      </p>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground md:p-8">
        <span>
          {pad(active + 1)} <span className="text-muted-foreground/60">/ {pad(total)}</span>
        </span>
        <span className="hidden md:block">拖动 / 滚动切换</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-5 pt-16 md:p-8 md:pt-24">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <h3 className="whitespace-pre-line font-display text-2xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              <Organization name={current.organization} />
            </h3>
            {current.role ? (
              <p className="mt-1.5 text-sm text-foreground/75 md:text-base">{current.role}</p>
            ) : null}
            <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
              {current.range}
            </p>
          </div>
          <p className="hidden max-w-md text-sm leading-relaxed text-foreground/60 md:block [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {current.detail ??
              "这段经历的详细介绍待补充：可以写负责的内容、参与的项目，以及这段经历带来的思考。"}
          </p>
        </div>
      </div>
    </div>
  );
};
