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
const HOLE_RADIUS = 0.68;
const DEPTH = 2.8;
const FOCAL = 4.2;
// Fixed viewing angle: tips the tunnel so its inner and outer rims meet at
// the lower-left. The pointer rotation is layered on top of this base view.
const BASE_VIEW = { x: 0.235, y: 0.235 };
const CENTER_SHIFT = 0.055;
// On wide screens the ring is capped by height, so without compensation its
// left margin grows with the viewport. Shift it left by this share of the
// unused horizontal room to keep its placement consistent across sizes.
const SLACK_SHIFT = 0.75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * An open ring receding deep into the screen: the dense inner edge sits far
 * from the viewer, the sparse outer edge sits close, and the centre stays
 * empty. Irregular depth offsets give the sheet a scattered, uneven volume.
 */
const createParticles = (count: number): Particle[] => {
  const particles: Particle[] = [];

  for (let index = 0; index < count; index += 1) {
    const radius =
      HOLE_RADIUS +
      (1 - HOLE_RADIUS) * Math.pow(Math.random(), 1.35);
    const angle = Math.random() * TAU;
    const spread = (radius - HOLE_RADIUS) / (1 - HOLE_RADIUS);

    // Low-frequency lobes make the sheet's thickness uneven around the ring.
    const irregularity =
      Math.sin(angle * 2.3 + 1.1) * 0.5 +
      Math.sin(angle * 5.9 + radius * 7.7) * 0.3 +
      Math.sin(angle * 11.7 - radius * 4.3) * 0.2;
    const thickness = 0.22 + 0.78 * (0.5 + 0.5 * irregularity);
    const depthJitter = (Math.random() + Math.random() - 1) * thickness;

    // A few particles detach from the sheet and drift deeper into the void.
    const stray = Math.random() < 0.06 ? -Math.random() * 1.8 : 0;

    particles.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: -DEPTH * (1 - spread) + depthJitter + stray,
      size: 0.5 + Math.random() * 0.8,
      alpha: 0.45 + Math.random() * 0.5,
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
    let dustParticles: Particle[] = [];

    const getRingScale = () =>
      Math.min(width * 0.44, Math.max(0, height - 170) * 0.48);

    const getRingCenterX = () => {
      const widthScale = width * 0.44;
      const horizontalSlack = Math.max(0, widthScale - getRingScale());
      return width / 2 - width * CENTER_SHIFT - horizontalSlack * SLACK_SHIFT;
    };

    /**
     * Sparse dust that fills the empty panel corners. It lives in the same
     * 3D space as the ring, so it follows the pointer rotation; positions are
     * pre-compensated so the corners are covered at rest.
     */
    const createDustParticles = (count: number) => {
      const scale = getRingScale();
      const centerX = getRingCenterX();
      const centerY = height * 0.477;
      const clearance = scale * 0.86;
      const clearanceSq = clearance * clearance;

      const topInset = width >= 768 ? 88 : 76;
      const bottomInset = width >= 768 ? 130 : 168;
      const sideInset = Math.max(18, width * 0.022);
      const top = topInset;
      const bottom = Math.max(top + 1, height - bottomInset);
      const left = sideInset;
      const right = Math.max(left + 1, width - sideInset);

      const dust: Particle[] = [];
      const maxAttempts = count * 10;

      let attempts = 0;

      while (dust.length < count && attempts < maxAttempts) {
        attempts += 1;

        const screenX = left + Math.random() * (right - left);
        const screenY = top + Math.random() * (bottom - top);
        const offsetX = screenX - centerX;
        const offsetY = screenY - centerY;

        if (offsetX * offsetX + offsetY * offsetY < clearanceSq) continue;

        const z = (Math.random() - 0.7) * 0.9;
        const restPerspective = FOCAL / (FOCAL - z * 0.9);
        const isLarge = Math.random() < 0.04;

        dust.push({
          x: offsetX / (scale * restPerspective),
          y: offsetY / (scale * restPerspective),
          z,
          size: isLarge ? 1 + Math.random() * 0.6 : 0.32 + Math.random() * 0.62,
          alpha: isLarge
            ? 0.26 + Math.random() * 0.22
            : 0.16 + Math.random() * 0.24,
        });
      }

      return dust;
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;

      const focal = FOCAL;
      const scale = getRingScale();
      const centerX = getRingCenterX();
      const centerY = height * 0.477;
      const dustCosY = Math.cos(pointer.y);
      const dustSinY = Math.sin(pointer.y);
      const dustCosX = Math.cos(pointer.x);
      const dustSinX = Math.sin(pointer.x);

      const cosY = Math.cos(pointer.y + BASE_VIEW.y);
      const sinY = Math.sin(pointer.y + BASE_VIEW.y);
      const cosX = Math.cos(pointer.x + BASE_VIEW.x);
      const sinX = Math.sin(pointer.x + BASE_VIEW.x);

      context.fillStyle = "#111111";

      for (const particle of dustParticles) {
        const x1 = particle.x * dustCosY + particle.z * dustSinY;
        const z1 = particle.z * dustCosY - particle.x * dustSinY;
        const y1 = particle.y * dustCosX - z1 * dustSinX;
        const z2 = z1 * dustCosX + particle.y * dustSinX;
        const perspective = focal / (focal - z2 * 0.9);

        context.globalAlpha = clamp(
          particle.alpha * (0.9 + (perspective - 1) * 0.4),
          0.1,
          0.5,
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

      for (const particle of particles) {
        const x1 = particle.x * cosY + particle.z * sinY;
        const z1 = particle.z * cosY - particle.x * sinY;
        const y1 = particle.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + particle.y * sinX;
        const perspective = focal / (focal - z2 * 0.9);

        context.globalAlpha = clamp(
          particle.alpha * (0.92 + (perspective - 1) * 0.55),
          0.14,
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

      const count = width < 560 ? 2100 : width < 1000 ? 3500 : 5800;
      if (particles.length !== count) particles = createParticles(count);

      const dustCount = width < 560 ? 450 : width < 1000 ? 1000 : 2200;
      dustParticles = createDustParticles(dustCount);

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

      target.y = normalizedX * -0.7;
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
