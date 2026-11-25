import { useCallback, useEffect, useRef } from "react";
const SENSITIVITY = 0.8;
const SEEK_EPSILON = 0.001;
const VIDEO_SRC = "/hero-motion-h264.mp4";
export const VideoHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const requestedTargetRef = useRef<number | null>(null);
  const pendingTargetRef = useRef<number | null>(null);
  const startSeek = useCallback((video: HTMLVideoElement, target: number) => {
    if (Math.abs(video.currentTime - target) <= SEEK_EPSILON) {
      requestedTargetRef.current = video.currentTime;
      return;
    }
    isSeekingRef.current = true;
    video.currentTime = target;
  }, []);
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || requestedTargetRef.current !== null) {
      return;
    }
    const previewTime = video.duration * 0.1;
    requestedTargetRef.current = previewTime;
    startSeek(video, previewTime);
  }, [startSeek]);
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    isSeekingRef.current = false;
    const pendingTarget = pendingTargetRef.current;
    pendingTargetRef.current = null;
    if (pendingTarget !== null && Math.abs(video.currentTime - pendingTarget) > SEEK_EPSILON) {
      startSeek(video, pendingTarget);
      return;
    }
    requestedTargetRef.current = video.currentTime;
  }, [startSeek]);
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const previousX = prevXRef.current;
      prevXRef.current = event.clientX;
      if (previousX === null) return;
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || window.innerWidth <= 0) {
        return;
      }
      const delta = event.clientX - previousX;
      const timeOffset = delta / window.innerWidth * SENSITIVITY * video.duration;
      const baseTime = requestedTargetRef.current ?? video.currentTime;
      const targetTime = Math.min(video.duration, Math.max(0, baseTime + timeOffset));
      if (Math.abs(targetTime - baseTime) <= SEEK_EPSILON) return;
      requestedTargetRef.current = targetTime;
      if (isSeekingRef.current) {
        pendingTargetRef.current = targetTime;
        return;
      }
      startSeek(video, targetTime);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [startSeek]);
  return <section className="relative h-[100svh] w-full cursor-ew-resize overflow-hidden bg-background" aria-label="Interactive motion study">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" src={VIDEO_SRC} muted playsInline preload="auto" onLoadedMetadata={handleLoadedMetadata} onSeeked={handleSeeked} aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col px-5 py-5 text-foreground md:px-8 md:py-7">
        <nav className="pointer-events-auto flex items-center justify-between gap-5 border-b border-foreground/50 pb-5">
          <a href="#manifesto" className="font-display text-lg font-semibold uppercase tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground text-[#F9F9F9FF]">
            A/FORM
          </a>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] sm:gap-7 sm:text-xs">
            <a className="transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground" href="#studies">
              Studies
            </a>
            <a className="transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground" href="#process">
              Process
            </a>
            <a className="transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground" href="#screenings">
              Screenings
            </a>
          </div>
        </nav>

        <div className="mt-7 grid gap-5 md:mt-10 md:grid-cols-12">
          <h1 className="pb-5 font-display text-[clamp(4rem,8.6vw,8.5rem)] font-semibold uppercase leading-[0.74] tracking-[-0.085em] md:col-span-7">
            Form<br />in flux
          </h1>
          <p className="hidden self-end pb-5 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-accent md:col-span-2 md:col-start-11 md:block">
            Interactive motion archive<br />Move horizontally
          </p>
        </div>
      </div>
    </section>;
};