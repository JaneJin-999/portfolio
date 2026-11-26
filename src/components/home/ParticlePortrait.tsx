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
    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f2ece3";

    const random = createRandom(582);
    const step = PARTICLE_SIZE;

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

        context.beginPath();
        context.arc(px, py, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
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
          className="block h-auto w-full border border-border"
        />
      ) : (
        <div
          className="aspect-square w-full border border-border bg-card/20"
          aria-hidden="true"
        />
      )}
    </div>
  );
};
