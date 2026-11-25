import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
};

const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A filled circular cloud: most points cluster near the middle, the rim is
 * sparse, and the depth spread reads as a shallow cylinder once rotated.
 */
const createParticles = (count: number): Particle[] => {
  const particles: Particle[] = [];

  for (let index = 0; index < count; index += 1) {
    const isRim = index % 12 === 0;
    const radius = isRim
      ? 0.86 + Math.random() * 0.14
      : Math.pow(Math.random(), 1.85);
    const angle = Math.random() * TAU;

    particles.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: (Math.random() * 2 - 1) * 0.72,
      size: isRim ? 0.5 + Math.random() * 0.6 : 0.65 + Math.random() * 1.05,
      alpha: isRim ? 0.25 + Math.random() * 0.3 : 0.38 + Math.random() * 0.5,
    });
  }

  return particles;
};

interface ParticleFieldProps {
  className?: string;
}

export const ParticleField = ({ className }: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");

    if (!canvas || !host || !context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let inView = true;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;

      const focal = 3.4;
      const scale = Math.min(width * 0.42, height * 0.34);
      const centerX = width / 2;
      const centerY = height * 0.47;
      const cosY = Math.cos(pointer.y);
      const sinY = Math.sin(pointer.y);
      const cosX = Math.cos(pointer.x);
      const sinX = Math.sin(pointer.x);

      context.fillStyle = "#111111";

      for (const particle of particles) {
        const x1 = particle.x * cosY + particle.z * sinY;
        const z1 = particle.z * cosY - particle.x * sinY;
        const y1 = particle.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + particle.y * sinX;
        const perspective = focal / (focal - z2 * 0.9);

        context.globalAlpha = clamp(
          particle.alpha * (0.62 + (perspective - 1) * 1.7),
          0.1,
          0.95,
        );
        context.beginPath();
        context.arc(
          centerX + x1 * scale * perspective,
          centerY + y1 * scale * perspective,
          particle.size * perspective,
          0,
          TAU,
        );
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const step = (time: number) => {
      frame = 0;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = time;

      const ease = 1 - Math.exp(-delta * 7);
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;

      const settled =
        Math.abs(target.x - pointer.x) < 0.0006 &&
        Math.abs(target.y - pointer.y) < 0.0006;

      if (settled) {
        pointer.x = target.x;
        pointer.y = target.y;
      }

      draw();

      if (!settled && inView) {
        frame = window.requestAnimationFrame(step);
      } else {
        lastTime = 0;
      }
    };

    const start = () => {
      if (reduceMotion || frame || !inView) return;
      lastTime = 0;
      frame = window.requestAnimationFrame(step);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 560 ? 850 : width < 1000 ? 1500 : 2100;
      if (particles.length !== count) particles = createParticles(count);

      draw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion) return;

      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const normalizedX = clamp(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -1,
        1,
      );
      const normalizedY = clamp(
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
        -1,
        1,
      );

      target.y = normalizedX * 0.7;
      target.x = normalizedY * 0.45;
      start();
    };

    const resetPointer = () => {
      if (reduceMotion) return;
      target.x = 0;
      target.y = 0;
      start();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") resetPointer();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        inView = entry.isIntersecting;

        if (inView) {
          start();
        } else if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
          lastTime = 0;
        }
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(host);

    host.addEventListener("pointermove", handlePointerMove, { passive: true });
    host.addEventListener("pointerleave", resetPointer);
    host.addEventListener("pointercancel", resetPointer);
    host.addEventListener("pointerup", handlePointerUp);

    resize();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", resetPointer);
      host.removeEventListener("pointercancel", resetPointer);
      host.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn("block", className)} aria-hidden="true" />;
};
