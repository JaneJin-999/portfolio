import { useEffect, useRef } from "react";
import { getParticleGeometry } from "@/components/home/particleGeometry";

interface HeroIntroProps {
  onComplete: () => void;
}

type ScatterParticle = {
  angle: number;
  radiusOffset: number;
  speed: number;
  drift: number;
  size: number;
};

const TAU = Math.PI * 2;
const LINE_START = 0.12;
const LINE_DURATION = 1.15;
const JUMP_DURATION = 0.38;
const EXPAND_DURATION = 0.58;
const SCATTER_DURATION = 0.95;

const LINE_END = LINE_START + LINE_DURATION;
const JUMP_END = LINE_END + JUMP_DURATION;
const EXPAND_END = JUMP_END + EXPAND_DURATION;
const SCATTER_END = EXPAND_END + SCATTER_DURATION;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Opening title sequence: on black, a solid dot draws a line from right to
 * left, jumps to the far opening of the particle tunnel, expands into a thin
 * outlined circle, then breaks into scattered particles as the field appears.
 */
export const HeroIntro = ({ onComplete }: HeroIntroProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  const skipRef = useRef<() => void>(() => {});

  onCompleteRef.current = onComplete;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!wrapper || !canvas || !context) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCompleteRef.current();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let width = 0;
    let height = 0;
    let farX = 0;
    let farY = 0;
    let farRadius = 0;
    let lineY = 0;
    let frame = 0;
    let startTime = 0;
    let finished = false;
    let fadeStarted = false;
    let completeTimer = 0;

    const scatter: ScatterParticle[] = Array.from({ length: 180 }, () => ({
      angle: Math.random() * TAU,
      radiusOffset: (Math.random() - 0.5) * 4,
      speed: 55 + Math.random() * 240,
      drift: (Math.random() - 0.5) * 0.9,
      size: 0.7 + Math.random() * 1.6,
    }));

    const complete = () => {
      if (finished) return;
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      wrapper.style.opacity = "0";
      onCompleteRef.current();
    };

    const skip = () => {
      if (finished) return;
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      wrapper.style.transition = "opacity 240ms ease";
      wrapper.style.opacity = "0";
      completeTimer = window.setTimeout(() => onCompleteRef.current(), 250);
    };

    skipRef.current = skip;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const hero = canvas.closest("section");
      const heroRect = (hero ?? canvas).getBoundingClientRect();
      const geometry = getParticleGeometry(
        heroRect.width || width,
        heroRect.height || height,
      );

      farX = heroRect.left + geometry.farCenterX;
      farY = heroRect.top + geometry.farCenterY;
      farRadius = geometry.farRadius;
      lineY = heroRect.top + (heroRect.height || height) * 0.5;
    };

    const draw = (elapsed: number) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#ffffff";
      context.strokeStyle = "#ffffff";
      context.lineWidth = 1.2;

      const startX = width + 14;
      const endX = -14;
      const lineProgress = easeInOutCubic(
        clamp01((elapsed - LINE_START) / LINE_DURATION),
      );
      const dotAlongLineX = startX + (endX - startX) * lineProgress;

      if (elapsed >= LINE_START) {
        const lineAlpha =
          elapsed < JUMP_END
            ? 0.9
            : Math.max(0, 0.9 * (1 - (elapsed - JUMP_END) / 0.45));

        if (lineAlpha > 0) {
          context.globalAlpha = lineAlpha;
          context.beginPath();
          context.moveTo(startX, lineY);
          context.lineTo(elapsed < LINE_END ? dotAlongLineX : endX, lineY);
          context.stroke();
        }
      }

      let dotX = dotAlongLineX;
      let dotY = lineY;
      let dotAlpha = 1;

      if (elapsed >= LINE_END) {
        const jumpProgress = easeInOutCubic(
          clamp01((elapsed - LINE_END) / JUMP_DURATION),
        );
        dotX = endX + (farX - endX) * jumpProgress;
        dotY = lineY + (farY - lineY) * jumpProgress;
      }

      if (elapsed >= JUMP_END) {
        dotX = farX;
        dotY = farY;
        dotAlpha = Math.max(0, 1 - (elapsed - JUMP_END) / 0.18);
      }

      if (elapsed >= LINE_START && dotAlpha > 0) {
        context.globalAlpha = dotAlpha;
        context.beginPath();
        context.arc(dotX, dotY, 5.5, 0, TAU);
        context.fill();
      }

      if (elapsed >= JUMP_END) {
        const expandProgress = easeOutCubic(
          clamp01((elapsed - JUMP_END) / EXPAND_DURATION),
        );
        const radius = 5.5 + (farRadius - 5.5) * expandProgress;
        let ringAlpha = 0.95;

        if (elapsed >= EXPAND_END) {
          ringAlpha = Math.max(0, 0.95 * (1 - (elapsed - EXPAND_END) / 0.4));
        }

        if (ringAlpha > 0) {
          context.globalAlpha = ringAlpha;
          context.beginPath();
          context.arc(farX, farY, radius, 0, TAU);
          context.stroke();
        }
      }

      if (elapsed >= EXPAND_END) {
        const scatterProgress = easeOutCubic(
          clamp01((elapsed - EXPAND_END) / SCATTER_DURATION),
        );
        const fade = 1 - clamp01((elapsed - EXPAND_END) / SCATTER_DURATION);

        for (const particle of scatter) {
          const radius =
            farRadius + particle.radiusOffset + particle.speed * scatterProgress;
          const angle = particle.angle + particle.drift * scatterProgress;

          context.globalAlpha = fade * 0.9;
          context.beginPath();
          context.arc(
            farX + Math.cos(angle) * radius,
            farY + Math.sin(angle) * radius,
            particle.size,
            0,
            TAU,
          );
          context.fill();
        }
      }

      context.globalAlpha = 1;
    };

    const tick = (time: number) => {
      if (finished) return;
      if (!startTime) startTime = time;

      const elapsed = (time - startTime) / 1000;
      draw(elapsed);

      if (!fadeStarted && elapsed >= EXPAND_END) {
        fadeStarted = true;
        wrapper.style.transition = `opacity ${SCATTER_DURATION}s ease`;
        wrapper.style.opacity = "0";
      }

      if (elapsed >= SCATTER_END) {
        complete();
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    const handleResize = () => measure();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };

    measure();
    frame = window.requestAnimationFrame(tick);

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (completeTimer) window.clearTimeout(completeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] cursor-pointer bg-black"
      onPointerDown={() => skipRef.current()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
