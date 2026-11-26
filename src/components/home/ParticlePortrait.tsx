import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Upload } from "lucide-react";

type SourceImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

const MAX_SIZE = 1600;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<SourceImage | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const [renderKey, setRenderKey] = useState(0);
  const [size, setSize] = useState(4);
  const [error, setError] = useState<string | null>(null);

  const render = useCallback((step: number) => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height, data } = source;
    canvas.width = width;
    canvas.height = height;

    context.fillStyle = "#ededeb";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#171717";

    const random = createRandom(582);

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
        const darkness = 1 - brightness;

        if (darkness < 0.025) continue;

        const radius =
          step *
          0.61 *
          Math.sqrt(darkness) *
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

    if (!context) {
      setError("Could not read this image.");
      setLoadingDefault(false);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    sourceRef.current = {
      width,
      height,
      data: context.getImageData(0, 0, width, height).data,
    };

    setError(null);
    setHasImage(true);
    setLoadingDefault(false);
    setRenderKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (!cancelled) processImage(image);
    };

    image.onerror = () => {
      if (cancelled) return;
      setLoadingDefault(false);
      setError("Could not load the default portrait.");
    };

    image.src = DEFAULT_PORTRAIT_SRC;

    return () => {
      cancelled = true;
    };
  }, [processImage]);

  useEffect(() => {
    if (hasImage) render(size);
  }, [hasImage, renderKey, size, render]);

  const openPicker = () => inputRef.current?.click();

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      processImage(image);
      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      setError("Could not load this image.");
      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "particle-portrait.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="sr-only"
        aria-label="Upload a portrait photo"
      />

      {hasImage ? (
        <>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Particle portrait of the uploaded photo"
            className="block h-auto w-full border border-border bg-[#ededeb]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <button
              type="button"
              onClick={openPicker}
              className="text-accent transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Change
            </button>
            <label className="flex items-center gap-2">
              <span>Size</span>
              <input
                type="range"
                min={2}
                max={10}
                step={0.5}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="h-1 w-20 cursor-pointer accent-[hsl(var(--accent))]"
                aria-label="Particle size"
              />
            </label>
            <button
              type="button"
              onClick={save}
              className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Save PNG
            </button>
          </div>
        </>
      ) : loadingDefault ? (
        <div className="flex aspect-square w-full items-center justify-center border border-border bg-card/30">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Preparing portrait
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="group flex aspect-square w-full flex-col items-center justify-center gap-3 border border-border bg-card/30 px-6 text-center transition-colors hover:border-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <Upload className="size-5 text-accent" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Add portrait
          </span>
          <span className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
            Upload a photo to turn it into a monochrome particle portrait.
          </span>
        </button>
      )}

      {error ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};
