import { useCallback, useEffect, useRef, useState } from "react";

type SourceImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

const MAX_SIZE = 1600;
const PARTICLE_SIZE = 3.5;
const DEFAULT_PORTRAIT_SRC = "/portrait-default.jpg";

const createRandom = (seed: number) => {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const ParticlePortrait = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<SourceImage | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height, data } = source;
    const padding = Math.round(Math.max(width, height) * 0.06);
    const bottomPadding = Math.round(Math.max(width, height) * 0.18);
    const canvasWidth = width + padding * 2;
    const canvasHeight = height + padding + bottomPadding;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "#f2ece3";

    const random = createRandom(582);
    const step = PARTICLE_SIZE;
    const centerX = width / 2;
    const centerY = height / 2;
    const edgeBand = Math.max(70, Math.min(width, height) * 0.085);

    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        const px = Math.min(
          width - 1,
          Math.max(0, Math.floor(x + (random() - 0.5) * step * 0.65)),
        );
        const py = Math.min(
          height - 1,
          Math.max(0, Math.floor(y + (random() - 0.5) * step * 0.65)),
        );
        const index = (py * width + px) * 4;
        const brightness =
          (data[index] * 0.2126 +
            data[index + 1] * 0.7152 +
            data[index + 2] * 0.0722) /
          255;
        if (brightness < 0.55) continue;

        const radius =
          step *
          0.5 *
          Math.sqrt(brightness) *
          (0.82 + random() * 0.36);

        let drawX = padding + px;
        let drawY = padding + py;
        const edgeDistance = Math.min(px, py, width - px, height - py);

        context.globalAlpha = 1;

        if (edgeDistance < edgeBand) {
          const bleed = 1 - edgeDistance / edgeBand;
          const directionX = px - centerX;
          const directionY = py - centerY;
          const directionLength =
            Math.hypot(directionX, directionY) || 1;
          const offset = bleed * padding * 0.9 * (0.4 + random() * 0.6);

          drawX += (directionX / directionLength) * offset;
          drawY += (directionY / directionLength) * offset;
          context.globalAlpha = 1 - bleed * 0.55;
        }

        // The photo has more particles toward the bottom, so let that edge
        // scatter further down into the extra transparent space.
        const bottomBand = Math.max(200, height * 0.3);
        const bottomDistance = height - py;

        if (bottomDistance < bottomBand) {
          const bottomBleed = 1 - bottomDistance / bottomBand;

          // Thin the count gradually across the lower part of the photo.
          if (random() < bottomBleed * 0.8) continue;

          const spread =
            bottomBleed *
            (bottomPadding - padding) *
            (0.45 + random() * 0.4);

          drawY += spread;
          drawX +=
            ((px - centerX) / Math.max(1, width / 2)) * spread * 0.1;

          // Start from full opacity at the top of the fade so there is no
          // visible horizontal seam where the gradient begins.
          context.globalAlpha = 1 - bottomBleed * 0.95;
        }

        context.beginPath();
        context.arc(drawX, drawY, radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalAlpha = 1;
  }, []);

  const processImage = useCallback((image: HTMLImageElement) => {
    const scale = MAX_SIZE / Math.max(image.width, image.height);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const source = document.createElement("canvas");
    source.width = width;
    source.height = height;

    const context = source.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    sourceRef.current = {
      width,
      height,
      data: context.getImageData(0, 0, width, height).data,
    };

    setHasImage(true);
    setRenderKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (!cancelled) processImage(image);
    };

    image.src = DEFAULT_PORTRAIT_SRC;

    return () => {
      cancelled = true;
    };
  }, [processImage]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, renderKey, render]);

  return (
    <div>
      {hasImage ? (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Particle portrait"
          className="block h-auto w-full md:origin-top-left md:scale-150"
        />
      ) : (
        <div
          className="aspect-[1792/1984] w-full"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
