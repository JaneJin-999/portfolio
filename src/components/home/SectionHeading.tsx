interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
}

export const SectionHeading = ({
  index,
  eyebrow,
  title,
}: SectionHeadingProps) => (
  <header className="grid gap-5 border-t border-border pt-5 md:grid-cols-12 md:gap-6">
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent md:col-span-3">
      <span>{index}</span>
      <span className="h-px w-8 bg-accent" aria-hidden="true" />
      <span>{eyebrow}</span>
    </div>
    <h2 className="font-display text-4xl font-semibold uppercase leading-[0.92] tracking-[-0.045em] text-foreground md:col-span-9 md:text-6xl lg:text-7xl">
      {title}
    </h2>
  </header>
);
