import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
export interface CareerEntry {
  period: string;
  organization: string;
  role: string;
  kind: string;
  range: string;
  note?: string;
  image?: string;
  imageAlt?: string;
  detail?: string;
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pad = (value: number) => String(value).padStart(2, "0");
const RollingPeriod = ({
  value,
  animate
}: {
  value: string;
  animate: boolean;
}) => {
  if (!animate) return <span className="tabular-nums">{value}</span>;
  return <span className="inline-flex" aria-hidden="true">
      {value.split("").map((char, index) => <span key={index} className="relative inline-block h-[1em] overflow-hidden align-top text-center tabular-nums" style={{
      width: char === "." ? "0.34em" : "0.64em"
    }}>
          <AnimatePresence initial={false}>
            <motion.span key={char} className="absolute inset-0 flex items-center justify-center font-[700]" initial={{
          y: "100%"
        }} animate={{
          y: "0%"
        }} exit={{
          y: "-100%"
        }} transition={{
          duration: 0.5,
          ease: [0.2, 0, 0, 1]
        }}>
              {char}
            </motion.span>
          </AnimatePresence>
        </span>)}
    </span>;
};
export const CareerTimeline = ({
  entries
}: {
  entries: CareerEntry[];
}) => {
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragRef = useRef<{
    id: number;
    x: number;
    left: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [readyImage, setReadyImage] = useState<string | null>(null);
  const measure = useCallback(() => {
    const reel = reelRef.current;
    if (!reel) return;
    const maxScroll = reel.scrollWidth - reel.clientWidth;
    const step = entries.length > 1 ? maxScroll / (entries.length - 1) : 0;
    const nextActive = step > 0 ? clamp(Math.round(reel.scrollLeft / step), 0, entries.length - 1) : 0;
    itemRefs.current.forEach((element, index) => {
      if (!element) return;
      if (reduceMotion) {
        element.style.transform = "";
        element.style.opacity = "";
        return;
      }
      const distance = step > 0 ? Math.max(0, (element.offsetLeft - reel.scrollLeft) / step) : Math.max(0, index - nextActive);
      const span = Math.min(distance, 2);
      element.style.transformOrigin = "center bottom";
      element.style.transform = `scale(${(1 - Math.min(span, 1) * 0.23).toFixed(4)})`;
      element.style.opacity = String(Math.max(0.5, 1 - span * 0.16));
    });
    setActive(nextActive);
  }, [entries.length, reduceMotion]);
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    let frame = 0;
    const request = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    reel.addEventListener("scroll", request, {
      passive: true
    });
    window.addEventListener("resize", request);
    const initial = requestAnimationFrame(measure);
    if (document.fonts?.ready) void document.fonts.ready.then(request);
    return () => {
      reel.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(initial);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);
  useEffect(() => {
    const reel = reelRef.current;
    const track = trackRef.current;
    if (!reel || !track) return;
    const update = () => {
      const styles = getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const columns = window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
      const width = Math.max(0, (reel.clientWidth - gap * (columns - 1)) / columns);
      if (width <= 0) return;
      track.style.setProperty("--card-w", `${width}px`);
      track.style.paddingRight = `${Math.max(0, reel.clientWidth - width)}px`;
      requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(update);
    observer.observe(reel);
    update();
    return () => observer.disconnect();
  }, [measure]);
  const goTo = useCallback((index: number) => {
    const reel = reelRef.current;
    if (!reel) return;
    const maxScroll = reel.scrollWidth - reel.clientWidth;
    const step = entries.length > 1 ? maxScroll / (entries.length - 1) : 0;
    reel.scrollTo({
      left: clamp(index, 0, entries.length - 1) * step,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }, [entries.length, reduceMotion]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!reelRef.current?.contains(document.activeElement)) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      goTo(active + (event.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const reel = reelRef.current;
    if (!reel) return;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      left: reel.scrollLeft,
      moved: false
    };
    reel.style.scrollSnapType = "none";
    reel.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const reel = reelRef.current;
    if (!drag || !reel || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 4) drag.moved = true;
    reel.scrollLeft = drag.left - delta;
  };
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const reel = reelRef.current;
    if (!drag || !reel || drag.id !== event.pointerId) return;
    dragRef.current = null;
    suppressClickRef.current = drag.moved;
    reel.style.scrollSnapType = "x mandatory";
    if (reel.hasPointerCapture(event.pointerId)) {
      reel.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    measure();
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(entries.length - 1);
    }
  };
  const monthOf = (value: string) => {
    const match = /^(\d{4})\.(\d{2})$/.exec(value.trim());
    return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null;
  };
  const endMonthOf = (range: string) => {
    const parts = range.split(/[–-]/).map(part => part.trim()).filter(Boolean);
    return monthOf(parts[parts.length - 1] ?? "");
  };
  const startMonths = entries.map(entry => monthOf(entry.period));
  const parsedStarts = startMonths.filter((value): value is number => value !== null);
  const earliestStart = parsedStarts.length ? Math.min(...parsedStarts) : 0;
  const latestEnd = entries.length ? Math.max(earliestStart, ...entries.map(entry => endMonthOf(entry.range) ?? monthOf(entry.period) ?? earliestStart)) : earliestStart;
  const axisStart = Math.floor(earliestStart / 12) * 12;
  const axisEnd = Math.floor(latestEnd / 12) * 12 + 11;
  const axisSpan = Math.max(1, axisEnd - axisStart);
  const nodeRatios = startMonths.map(month => month === null ? 0 : clamp((month - axisStart) / axisSpan, 0, 1));
  const axisTicks: Array<{
    ratio: number;
    major: boolean;
  }> = [];
  const yearTicks: Array<{
    ratio: number;
    year: number;
  }> = [];
  for (let month = axisStart; month <= axisEnd; month += 1) {
    if (month % 3 !== 0) continue;
    const isYear = month % 12 === 0;
    const ratio = (month - axisStart) / axisSpan;
    axisTicks.push({
      ratio,
      major: isYear
    });
    if (isYear) yearTicks.push({
      ratio,
      year: month / 12
    });
  }
  const current = entries[active] ?? entries[0];
  const scrubTo = (clientX: number) => {
    const reel = reelRef.current;
    const scale = scaleRef.current;
    if (!reel || !scale) return;
    const rect = scale.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const maxScroll = reel.scrollWidth - reel.clientWidth;
    if (maxScroll <= 0) return;
    const step = entries.length > 1 ? maxScroll / (entries.length - 1) : 0;
    let position = 0;
    const lastNode = nodeRatios[nodeRatios.length - 1] ?? 1;
    if (ratio >= lastNode) {
      position = maxScroll;
    } else if (ratio > (nodeRatios[0] ?? 0)) {
      for (let index = 0; index < nodeRatios.length - 1; index += 1) {
        const from = nodeRatios[index];
        const to = nodeRatios[index + 1];
        if (ratio <= to) {
          const between = to - from > 1e-6 ? (ratio - from) / (to - from) : 0;
          position = (index + between) * step;
          break;
        }
      }
    }
    reel.scrollLeft = position;
  };
  const startScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const reel = reelRef.current;
    if (!reel) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    reel.style.scrollSnapType = "none";
    scrubTo(event.clientX);
  };
  const moveScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    scrubTo(event.clientX);
  };
  const endScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    const reel = reelRef.current;
    if (!reel) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    reel.style.scrollSnapType = "x mandatory";
    measure();
  };
  useEffect(() => {
    const node = rootRef.current;
    const sources = Array.from(new Set(entries.map(entry => entry.image).filter((src): src is string => Boolean(src))));
    if (!sources.length) return;
    let cancelled = false;
    const preload = () => {
      if (cancelled) return;
      for (const src of sources) {
        const image = new Image();
        image.decoding = "async";
        image.src = src;
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      preload();
      return;
    }
    const observer = new IntersectionObserver(records => {
      if (records.some(record => record.isIntersecting)) {
        preload();
        observer.disconnect();
      }
    }, {
      rootMargin: "800px 0px"
    });
    if (node) observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [entries]);
  return <div ref={rootRef} className="mt-12 md:mt-16">
      <div className="grid gap-10 xl:grid-cols-12 xl:gap-12 mt-[60px] pt-[80px]">
        <aside className="order-2 xl:order-1 xl:col-span-4">
          <motion.div animate={{
          opacity: 1,
          y: 0
        }} className="xl:h-full" initial={reduceMotion ? false : {
          opacity: 0,
          y: 10
        }} key={active} transition={{
          duration: 0.4,
          ease: [0.2, 0, 0, 1]
        }}>
            <div className="relative aspect-square w-full overflow-hidden bg-card/40 xl:aspect-auto xl:h-full">
              {current?.image ? <img alt={current.imageAlt ?? current.organization} className={cn("absolute inset-0 h-full w-full object-cover object-[center_40%] transition-opacity duration-500", readyImage === current.image ? "opacity-100" : "opacity-0")} decoding="async" loading="eager" onLoad={() => setReadyImage(current.image ?? null)} src={current.image} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="font-display text-6xl font-semibold tracking-[-0.04em] text-foreground/15">
                    {pad(active + 1)}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                    图片待补充
                  </span>
                </div>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#140B0B]/80 via-[#140B0B]/35 to-transparent p-6 pt-24 md:p-7 md:pt-28">
                <p className={cn("whitespace-pre-line leading-relaxed", current?.detail ? "text-sm text-foreground/90 md:text-base" : "text-sm text-foreground/55")} style={{
                fontSize: "14px"
              }}>
                  {current?.detail ?? "这段经历的详细介绍待补充：可以写负责的内容、参与的项目，以及这段经历带来的思考。"}
                </p>
              </div>
            </div>
          </motion.div>
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:col-span-8 xl:flex xl:flex-col">
          <div className="relative -top-[10px] flex h-[1em] items-center justify-start overflow-hidden font-display text-[clamp(3rem,7vw,5.5rem)] font-semibold leading-none tracking-[-0.04em]">
            <RollingPeriod value={current?.period ?? ""} animate={!reduceMotion} />
          </div>

          <p className="sr-only" aria-live="polite">
            {`第 ${active + 1} 项，共 ${entries.length} 项：${current?.organization ?? ""}`}
          </p>

          <div aria-hidden="true" className="hidden xl:block xl:flex-1" />

      <div aria-label="学习与工作经历时间轴" aria-roledescription="carousel" className={cn("mt-12 w-full select-none overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", dragging ? "cursor-grabbing" : "cursor-grab")} onKeyDown={handleKeyDown} onPointerCancel={endDrag} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} ref={reelRef} role="group" tabIndex={0} style={{
          scrollSnapType: "x mandatory"
        }}>
        <div className="relative flex w-max items-stretch gap-5 md:gap-8 [--card-w:20rem]" ref={trackRef}>
          {entries.map((entry, index) => <div className="w-[var(--card-w)] shrink-0 snap-start will-change-transform" key={`${entry.period}-${entry.organization}`} ref={node => {
              itemRefs.current[index] = node;
            }}>
              <article className={cn("flex h-full min-h-[17rem] w-full flex-col p-6 transition-[border-width,border-color] duration-500 ease-out md:min-h-[19rem] md:p-7", active === index ? "border-y-8 border-foreground" : "border-y-2 border-border")}>
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-accent">[{pad(index + 1)}]</span>
                  {(entry.kind || entry.note) && <span>{entry.note ? `${entry.kind} · ${entry.note}` : entry.kind}</span>}
                </div>
                <h3 className="mt-12 whitespace-pre-line font-display text-xl font-bold leading-snug tracking-[-0.02em] md:text-2xl">
                  {entry.organization.includes("有限公司") ? (
                    <>
                      {entry.organization.slice(
                        0,
                        entry.organization.lastIndexOf("有限公司"),
                      )}
                      <span className="whitespace-nowrap">有限公司</span>
                    </>
                  ) : (
                    entry.organization
                  )}
                </h3>
                {entry.role && <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    {entry.role}
                  </p>}
                <p className="mt-auto pt-8 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                  {entry.range}
                </p>
              </article>
            </div>)}
        </div>
      </div>
        </div>
      </div>

      <div className="mt-32 pt-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <div className="flex w-full justify-center px-5 md:order-2 md:min-w-0 md:flex-1 md:px-0">
          <div aria-hidden="true" className="relative h-12 w-full cursor-ew-resize touch-none select-none md:max-w-[35rem]" onPointerCancel={endScrub} onPointerDown={startScrub} onPointerMove={moveScrub} onPointerUp={endScrub} ref={scaleRef}>
            {[...entries].sort((a, b) => (a.kind === "教育" ? 0 : a.kind === "实习" ? 2 : 1) - (b.kind === "教育" ? 0 : b.kind === "实习" ? 2 : 1)).map(entry => {
              const start = monthOf(entry.period);
              const end = endMonthOf(entry.range) ?? start;
              if (start === null || end === null) return null;
              const from = clamp((start - axisStart) / axisSpan, 0, 1);
              const to = clamp((end + 1 - axisStart) / axisSpan, 0, 1);
              return <span aria-hidden="true" className={cn("pointer-events-none absolute top-0 h-[5px] rounded-full", entry.kind === "教育" ? "bg-foreground/30" : entry.kind === "实习" ? "bg-accent/30" : "bg-foreground/10")} key={`duration-${entry.period}-${entry.organization}`} style={{
                left: `${from * 100}%`,
                width: `${Math.max(0.4, (to - from) * 100)}%`
              }} />;
            })}
            {axisTicks.map((tick, index) => <span aria-hidden="true" className={cn("pointer-events-none absolute top-0 w-px -translate-x-1/2 rounded-full", tick.major ? "bg-foreground/25" : "bg-foreground/10")} key={`axis-${index}`} style={{
              left: `${tick.ratio * 100}%`,
              height: tick.major ? 10 : 5
            }} />)}
            {entries.map((entry, index) => <span aria-hidden="true" className={cn("pointer-events-none absolute top-0 w-[2px] -translate-x-1/2 rounded-full transition-all duration-300", active === index ? "bg-accent" : "bg-foreground/50")} key={`node-${entry.period}-${entry.organization}`} style={{
              left: `${nodeRatios[index] * 100}%`,
              height: active === index ? 24 : 16
            }} />)}
            {yearTicks.map(tick => <span aria-hidden="true" className="pointer-events-none absolute top-[26px] -translate-x-1/2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground" key={`year-${tick.year}`} style={{
              left: `${tick.ratio * 100}%`
            }}>
                {tick.year}
              </span>)}
          </div>
          </div>
        </div>
      </div>
    </div>;
};