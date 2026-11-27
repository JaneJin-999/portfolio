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
const HOP_UP_DURATION = 0.15;
const HOP_FALL_DURATION = 0.38;
const EXPAND_DURATION = 0.58;
const SCATTER_DURATION = 0.95;
const AUTO_DRAW_DURATION = 0.9;
const IDLE_DELAY = 3000;
const DOT_HIT_RADIUS = 34;
const STOP_TOLERANCE = 20;

const LAND_TIME = HOP_UP_DURATION + HOP_FALL_DURATION;
const EXPAND_END_TIME = LAND_TIME + EXPAND_DURATION;
const TOTAL_TIME = EXPAND_END_TIME + SCATTER_DURATION;
const FADE_DURATION = EXPAND_DURATION + SCATTER_DURATION;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

/**
 * Opening sequence. On black, a solid dot waits near the right edge with a
 * short line stub. The visitor can drag it left to the point above the far
 * opening; releasing there starts the hop, drop, circle expansion and particle
 * scatter. Without interaction the same sequence auto-runs after five seconds.
 */
export const HeroIntro = ({ onComplete }: HeroIntroProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);

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

    const heroSection = canvas.closest("section");
    const heroBounds = (heroSection ?? canvas).getBoundingClientRect();

    if (heroBounds.bottom <= 0 || heroBounds.top >= window.innerHeight) {
      onCompleteRef.current();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    wrapper.style.cursor = "default";

    let width = 0;
    let height = 0;
    let farX = 0;
    let farY = 0;
    let farRadius = 0;
    let lineY = 0;
    let manualStartX = 0;
    let dotX = 0;
    let initialized = false;
    let reveal = 0;
    let closing = false;
    let closeStart = 0;
    let closeFrom = 0;
    let closeCallback: (() => void) | null = null;

    let phase: "idle" | "auto" | "sequence" = "idle";
    let dragging = false;
    let activePointerId: number | null = null;
    let frame = 0;
    let idleTimer = 0;
    let autoStart = 0;
    let autoFromX = 0;
    let sequenceStart = 0;
    let fadeStarted = false;
    let finished = false;
    let completeTimer = 0;

    const scatter: ScatterParticle[] = Array.from({ length: 180 }, () => ({
      angle: Math.random() * TAU,
      radiusOffset: (Math.random() - 0.5) * 4,
      speed: 55 + Math.random() * 240,
      drift: (Math.random() - 0.5) * 0.9,
      size: 0.7 + Math.random() * 1.6,
    }));

    const clearIdle = () => {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
        idleTimer = 0;
      }
    };

    const complete = () => {
      if (finished) return;
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      clearIdle();
      wrapper.style.opacity = "0";
      onCompleteRef.current();
    };

    const skip = () => {
      if (finished) return;
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      clearIdle();
      wrapper.style.transition = "opacity 240ms ease";
      wrapper.style.opacity = "0";
      completeTimer = window.setTimeout(() => onCompleteRef.current(), 250);
    };

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

      const startInset = width * 0.15;
      manualStartX = width - startInset;

      if (!initialized) {
        dotX = manualStartX;
        initialized = true;
      } else if (phase === "idle") {
        dotX = Math.min(manualStartX, Math.max(farX, dotX));
      }
    };

    const startAuto = () => {
      if (phase !== "idle" || dragging) return;
      clearIdle();
      phase = "auto";
      autoFromX = dotX;
      autoStart = performance.now();
    };

    const armIdle = () => {
      clearIdle();
      if (phase !== "idle") return;
      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        startAuto();
      }, IDLE_DELAY);
    };

    const triggerSequence = (now: number) => {
      if (phase === "sequence") return;
      clearIdle();
      phase = "sequence";
      sequenceStart = now;
      dotX = farX;
      wrapper.style.cursor = "default";
    };

    const startClose = (callback: () => void) => {
      if (reveal <= 0.001) {
        reveal = 0;
        callback();
        return;
      }

      closing = true;
      closeStart = performance.now();
      closeFrom = reveal;
      closeCallback = callback;
    };

    const drawMask = () => {
      context.fillStyle = "#140B0B";
      context.fillRect(0, 0, width, height);

      if (reveal > 0.001) {
        const maxGap = Math.min(280, Math.max(110, height * 0.22)) * reveal;
        const openLeft = Math.max(0, Math.min(width, dotX));
        const openWidth = Math.max(1, width - openLeft);
        const steps = 32;
        const curvePower = 1.4;

        // Curved zipper opening: zero height at the slider, widening to the
        // right edge, with both edges bending away from the drag line.
        context.save();
        context.beginPath();
        context.moveTo(openLeft, lineY);

        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps;
          const x = openLeft + openWidth * t;
          const y = lineY - maxGap * Math.pow(t, curvePower);
          context.lineTo(x, y);
        }

        for (let i = steps; i >= 0; i -= 1) {
          const t = i / steps;
          const x = openLeft + openWidth * t;
          const y = lineY + maxGap * Math.pow(t, curvePower);
          context.lineTo(x, y);
        }

        context.closePath();
        context.clip();
        context.clearRect(0, 0, width, height);
        context.restore();
      }

      context.fillStyle = "#F2EDE3";
    };

    const drawIdle = () => {
      drawMask();
      context.strokeStyle = "#F2EDE3";
      context.fillStyle = "#F2EDE3";
      context.lineWidth = 1.2;

      if (reveal < 0.02) {
        context.globalAlpha = 0.9;
        context.beginPath();
        context.moveTo(width + 14, lineY);
        context.lineTo(Math.max(farX, dotX), lineY);
        context.stroke();
      }

      if (phase === "idle" && !dragging && !closing && reveal < 0.02) {
        const haloRadius = 15;

        context.globalAlpha = 0.2;
        context.beginPath();
        context.arc(dotX, lineY, haloRadius, 0, TAU);
        context.stroke();

        context.globalAlpha = 0.55;
        context.font = '12px "IBM Plex Mono", ui-monospace, monospace';

        const label = "DRAG";
        const gap = 8;
        const arrowLength = 17;
        const hintY = lineY + 38;
        const arrowY = hintY - 4;
        const arrowLeft = dotX - arrowLength / 2;

        context.textAlign = "left";
        context.fillText(label, dotX + arrowLength / 2 + gap, hintY);

        context.beginPath();
        context.moveTo(arrowLeft, arrowY);
        context.lineTo(arrowLeft + arrowLength, arrowY);
        context.moveTo(arrowLeft + 5, arrowY - 5);
        context.lineTo(arrowLeft, arrowY);
        context.lineTo(arrowLeft + 5, arrowY + 5);
        context.stroke();
      }

      if (reveal > 0.02) {
        context.globalAlpha = 0.9;
        context.strokeStyle = "#140B0B";
        context.lineWidth = 2.4;
        context.beginPath();
        context.arc(dotX, lineY, 7, 0, TAU);
        context.stroke();
        context.strokeStyle = "#F2EDE3";
        context.lineWidth = 1.2;
      }

      context.globalAlpha = 1;
      context.beginPath();
      context.arc(dotX, lineY, 5.5, 0, TAU);
      context.fill();
      context.globalAlpha = 1;
    };

    const drawSequence = (time: number) => {
      drawMask();
      context.strokeStyle = "#F2EDE3";
      context.fillStyle = "#F2EDE3";
      context.lineWidth = 1.2;

      const hopHeight = Math.max(26, Math.min(60, (farY - lineY) * 0.35));
      const lineAlpha =
        time < LAND_TIME
          ? 0.9
          : Math.max(0, 0.9 * (1 - (time - LAND_TIME) / 0.45));

      if (lineAlpha > 0) {
        context.globalAlpha = lineAlpha;
        context.beginPath();
        context.moveTo(width + 14, lineY);
        context.lineTo(farX, lineY);
        context.stroke();
      }

      let dotY = lineY;
      let dotAlpha = 1;

      if (time < HOP_UP_DURATION) {
        const t = easeOutCubic(clamp01(time / HOP_UP_DURATION));
        dotY = lineY - hopHeight * t;
      } else if (time < LAND_TIME) {
        const t = easeInCubic(
          clamp01((time - HOP_UP_DURATION) / HOP_FALL_DURATION),
        );
        dotY = lineY - hopHeight + (farY - (lineY - hopHeight)) * t;
      } else {
        dotY = farY;
        dotAlpha = Math.max(0, 1 - (time - LAND_TIME) / 0.18);
      }

      if (dotAlpha > 0) {
        context.globalAlpha = dotAlpha;
        context.beginPath();
        context.arc(farX, dotY, 5.5, 0, TAU);
        context.fill();
      }

      if (time >= LAND_TIME) {
        const expandProgress = easeOutCubic(
          clamp01((time - LAND_TIME) / EXPAND_DURATION),
        );
        const radius = 5.5 + (farRadius - 5.5) * expandProgress;
        let ringAlpha = 0.95;

        if (time >= EXPAND_END_TIME) {
          ringAlpha = Math.max(0, 0.95 * (1 - (time - EXPAND_END_TIME) / 0.4));
        }

        if (ringAlpha > 0) {
          context.globalAlpha = ringAlpha;
          context.beginPath();
          context.arc(farX, farY, radius, 0, TAU);
          context.stroke();
        }
      }

      if (time >= EXPAND_END_TIME) {
        const scatterProgress = easeOutCubic(
          clamp01((time - EXPAND_END_TIME) / SCATTER_DURATION),
        );
        const fade = 1 - clamp01((time - EXPAND_END_TIME) / SCATTER_DURATION);

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

    const tick = (now: number) => {
      if (finished) return;

      if (closing) {
        const t = clamp01((now - closeStart) / 260);
        reveal = closeFrom * (1 - easeOutCubic(t));

        if (t >= 1) {
          reveal = 0;
          closing = false;
          const callback = closeCallback;
          closeCallback = null;
          if (callback) callback();
        }
      } else if (phase === "idle" && dragging) {
        const span = Math.max(1, manualStartX - farX);
        reveal = clamp01((manualStartX - dotX) / span);
      }

      if (phase === "auto") {
        const t = clamp01((now - autoStart) / (AUTO_DRAW_DURATION * 1000));
        const span = Math.max(1, manualStartX - farX);

        dotX = autoFromX + (farX - autoFromX) * easeInOutCubic(t);
        reveal = clamp01((manualStartX - dotX) / span);
        drawIdle();

        if (t >= 1) {
          dotX = farX;
          reveal = 1;
          phase = "idle";
          startClose(() => triggerSequence(performance.now()));
        }
      } else if (phase === "sequence") {
        const time = (now - sequenceStart) / 1000;
        drawSequence(time);

        if (!fadeStarted && time >= LAND_TIME) {
          fadeStarted = true;
          wrapper.style.transition = `opacity ${FADE_DURATION}s ease`;
          wrapper.style.opacity = "0";
        }

        if (time >= TOTAL_TIME) {
          complete();
          return;
        }
      } else {
        drawIdle();
      }

      frame = window.requestAnimationFrame(tick);
    };

    const hitDot = (event: PointerEvent) => {
      const dx = event.clientX - dotX;
      const dy = event.clientY - lineY;
      return dx * dx + dy * dy <= DOT_HIT_RADIUS * DOT_HIT_RADIUS;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (finished || closing || phase !== "idle") return;
      if (!hitDot(event)) return;

      event.preventDefault();
      dragging = true;
      activePointerId = event.pointerId;
      clearIdle();
      try {
        wrapper.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is a progressive enhancement for the drag.
      }
      wrapper.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (finished) return;

      if (!dragging) {
        if (phase === "idle") {
          wrapper.style.cursor = hitDot(event) ? "grab" : "default";
        }
        return;
      }

      if (event.pointerId !== activePointerId) return;
      dotX = Math.min(manualStartX, Math.max(farX, event.clientX));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== activePointerId) return;

      dragging = false;
      activePointerId = null;

      if (wrapper.hasPointerCapture(event.pointerId)) {
        wrapper.releasePointerCapture(event.pointerId);
      }

      wrapper.style.cursor = "default";

      if (dotX <= farX + STOP_TOLERANCE) {
        startClose(() => triggerSequence(performance.now()));
      } else {
        startClose(() => armIdle());
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };

    measure();
    drawIdle();
    wrapper.style.backgroundColor = "transparent";
    armIdle();
    frame = window.requestAnimationFrame(tick);

    wrapper.addEventListener("pointerdown", handlePointerDown);
    wrapper.addEventListener("pointermove", handlePointerMove);
    wrapper.addEventListener("pointerup", handlePointerUp);
    wrapper.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("resize", measure);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      finished = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (idleTimer) window.clearTimeout(idleTimer);
      if (completeTimer) window.clearTimeout(completeTimer);
      wrapper.removeEventListener("pointerdown", handlePointerDown);
      wrapper.removeEventListener("pointermove", handlePointerMove);
      wrapper.removeEventListener("pointerup", handlePointerUp);
      wrapper.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] touch-none select-none bg-[#140B0B]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
