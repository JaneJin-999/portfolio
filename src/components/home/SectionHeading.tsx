interface SectionHeadingProps {
  eyebrow: string;
  heading: string;
}

export const SectionHeading = ({ eyebrow, heading }: SectionHeadingProps) => (
  <header className="grid gap-5 border-t border-border pt-5 md:grid-cols-12 md:gap-6">
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent md:col-span-3">
      <span className="h-px w-8 bg-accent" aria-hidden="true" />
      <span>{eyebrow}</span>
    </div>
    <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground md:col-span-9 md:text-right md:text-4xl">
      {heading}
    </h2>
  </header>
);
