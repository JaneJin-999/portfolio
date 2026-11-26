interface SectionHeadingProps {
  eyebrow: string;
}

export const SectionHeading = ({ eyebrow }: SectionHeadingProps) => (
  <header className="grid gap-5 border-t border-border pt-5 md:grid-cols-12 md:gap-6">
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent md:col-span-3">
      <span className="h-px w-8 bg-accent" aria-hidden="true" />
      <span>{eyebrow}</span>
    </div>
  </header>
);
