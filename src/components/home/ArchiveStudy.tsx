import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchiveStudyProps {
  index: string;
  title: string;
  medium: string;
  timecode: string;
  imageSrc: string;
  imageAlt: string;
  mediaClassName?: string;
  imageClassName?: string;
  className?: string;
}

export const ArchiveStudy = ({
  index,
  title,
  medium,
  timecode,
  imageSrc,
  imageAlt,
  mediaClassName,
  imageClassName,
  className,
}: ArchiveStudyProps) => (
  <div
    className={cn(
      "group block cursor-default rounded-2xl border border-border bg-card/40 p-2 transition-all duration-500 hover:-translate-y-1 hover:border-accent/70",
      className,
    )}
  >
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-xl bg-card",
        mediaClassName,
      )}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        crossOrigin="anonymous"
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]",
          imageClassName,
        )}
      />
      <div
        className="pointer-events-none absolute inset-3 rounded-lg border border-foreground/20"
        aria-hidden="true"
      />
    </div>
    <div className="grid grid-cols-[1fr_auto] gap-5 px-3 pb-3 pt-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {index} / {medium}
        </p>
        <h3 className="mt-2 font-display text-2xl font-medium uppercase tracking-[-0.03em] text-foreground">
          {title}
        </h3>
      </div>
      <div className="flex flex-col items-end justify-between">
        <ArrowUpRight className="size-5 text-accent transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        <span className="font-mono text-[11px] text-muted-foreground">
          {timecode}
        </span>
      </div>
    </div>
  </div>
);
