import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArchiveStudy } from "@/components/home/ArchiveStudy";
import { SectionHeading } from "@/components/home/SectionHeading";
import { VideoHero } from "@/components/home/VideoHero";

const screenings = [
  { date: "04.26", place: "Berlin / DE", title: "Synthetic Landscapes" },
  { date: "06.12", place: "Kyoto / JP", title: "Time As Material" },
  { date: "09.08", place: "Montréal / CA", title: "Signals After Dark" },
];

const process = [
  {
    index: "01",
    title: "Capture",
    text: "Light, movement and error are recorded as equal source material.",
  },
  {
    index: "02",
    title: "Displace",
    text: "Frames are stretched, interrupted and reorganized outside linear time.",
  },
  {
    index: "03",
    title: "Resolve",
    text: "The final image remains open, waiting for the viewer to activate it.",
  },
];

const Reveal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Index = () => (
  <main className="bg-background text-foreground">
    <VideoHero />

    <div className="scanline-field h-20 border-b border-border" aria-hidden="true" />

    <section id="manifesto" className="scroll-mt-20 px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Independent motion archive<br />2026 / ongoing
              </p>
            </div>
            <div className="md:col-span-9">
              <h1 className="max-w-6xl font-display text-[clamp(3.2rem,8vw,8.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.075em]">
                Motion is not decoration.
              </h1>
              <div className="mt-14 grid gap-8 border-t border-border pt-6 md:grid-cols-9">
                <p className="font-display text-2xl leading-tight text-accent md:col-span-5 md:text-4xl">
                  It is the only true record of time.
                </p>
                <p className="max-w-md text-base leading-relaxed text-muted-foreground md:col-span-4 md:text-lg">
                  A living study of light, duration and perception—built from images that refuse to stay still.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section id="studies" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading index="01" eyebrow="Archive" title="Selected studies" />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-12 md:gap-6">
          <Reveal className="md:col-span-7">
            <ArchiveStudy
              index="A-01"
              title="Recursive Field"
              medium="Motion study"
              timecode="00:14:08"
              imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-orbit_f89c7082.png"
              imageAlt="Sculptural koi curving across a lacquer-red field"
            />
          </Reveal>
          <Reveal className="md:col-span-5">
            <ArchiveStudy
              index="A-02"
              title="Phase Shift"
              medium="Signal work"
              timecode="00:08:21"
              imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-detail_a84a9fb3.png"
              imageAlt="Close study of flowing teal and ivory koi fins"
              mediaClassName="aspect-[4/5]"
            />
          </Reveal>
          <div className="hidden md:col-span-3 md:block" />
          <Reveal className="md:col-span-9">
            <ArchiveStudy
              index="A-03"
              title="After Image"
              medium="Light study"
              timecode="00:11:03"
              imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-ripple_e378eeb1.png"
              imageAlt="Koi silhouettes moving through dark rippling water"
              mediaClassName="aspect-video"
            />
          </Reveal>
        </div>
      </div>
    </section>

    <section id="process" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading index="02" eyebrow="Method" title="Made in intervals" />
        </Reveal>
        <div className="mt-16 grid border-b border-border md:grid-cols-3">
          {process.map((step) => (
            <article key={step.index} className="border-t border-border py-8 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
              <span className="font-mono text-xs text-accent">[{step.index}]</span>
              <h3 className="mt-16 font-display text-3xl font-medium uppercase tracking-[-0.04em]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="screenings" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading index="03" eyebrow="Public space" title="Screenings / installations" />
        </Reveal>
        <div className="mt-14 border-b border-border">
          {screenings.map((screening) => (
            <a
              key={screening.title}
              href="#contact"
              className="group grid min-h-28 items-center gap-3 border-t border-border py-5 transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none md:grid-cols-12 md:px-5"
            >
              <span className="font-mono text-xs text-accent md:col-span-2">2026.{screening.date}</span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">{screening.place}</span>
              <span className="font-display text-2xl uppercase tracking-[-0.03em] transition-colors group-hover:text-accent md:col-span-6 md:text-3xl">{screening.title}</span>
              <ArrowUpRight className="size-5 text-accent md:justify-self-end" />
            </a>
          ))}
        </div>
      </div>
    </section>

    <section id="contact" className="scroll-mt-20 bg-primary px-5 py-24 text-primary-foreground md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em]">Commissions / exhibitions / exchange</p>
        <a
          href="mailto:studio@aform.art"
          className="group mt-12 flex items-end justify-between gap-8 border-b-2 border-primary-foreground pb-5 font-display text-[clamp(3rem,10vw,10rem)] font-semibold uppercase leading-[0.82] tracking-[-0.075em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
        >
          Start a signal
          <ArrowDownRight className="mb-1 size-10 shrink-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 md:size-20" />
        </a>
      </div>
    </section>

    <footer className="technical-grid px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-[1600px] gap-10 border-t border-border pt-6 md:grid-cols-12">
        <p className="font-display text-xl font-semibold uppercase tracking-[-0.04em] md:col-span-4">A/FORM — Motion Archive</p>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground md:col-span-4">Independent experiments in image, motion and temporal perception.</p>
        <div className="font-mono text-[11px] uppercase leading-6 tracking-[0.15em] text-muted-foreground md:col-span-4 md:text-right">
          <p>Archived 2026–∞</p>
          <a className="transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none" href="mailto:studio@aform.art">studio@aform.art</a>
        </div>
      </div>
    </footer>
  </main>
);

export default Index;
