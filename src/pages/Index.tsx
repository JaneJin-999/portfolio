import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArchiveStudy } from "@/components/home/ArchiveStudy";
import { ParticleHero } from "@/components/home/ParticleHero";
import { ParticlePortrait } from "@/components/home/ParticlePortrait";
import { SectionHeading } from "@/components/home/SectionHeading";
const screenings = [{
  date: "04.26",
  place: "Berlin / DE",
  title: "Synthetic Landscapes"
}, {
  date: "06.12",
  place: "Kyoto / JP",
  title: "Time As Material"
}, {
  date: "09.08",
  place: "Montréal / CA",
  title: "Signals After Dark"
}];
const process = [{
  index: "01",
  title: "Capture",
  text: "Light, movement and error are recorded as equal source material."
}, {
  index: "02",
  title: "Displace",
  text: "Frames are stretched, interrupted and reorganized outside linear time."
}, {
  index: "03",
  title: "Resolve",
  text: "The final image remains open, waiting for the viewer to activate it."
}];
const Reveal = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={reduceMotion ? false : {
    opacity: 0,
    y: 24
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    amount: 0.15
  }} transition={{
    duration: 0.65,
    ease: [0.2, 0, 0, 1]
  }}>
      {children}
    </motion.div>;
};
const Index = () => <main className="bg-background text-foreground">
    <ParticleHero />

    <div className="scanline-field h-20 w-full border-b border-border" aria-hidden="true" />

    <section id="manifesto" className="scroll-mt-20 px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-3">
              <ParticlePortrait />
            </div>
            <div className="md:col-span-9">
              <div className="ml-auto flex w-fit flex-col items-end">
                <h1 className="max-w-6xl font-display text-[clamp(3.2rem,8vw,8.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.075em] text-right pt-[60px]" style={{
                marginTop: "4px",
                marginBottom: "4px"
              }}>
                  设计不止于表面
                </h1>
                <div className="mt-14 w-full border-t border-border" aria-hidden="true" />
              </div>
              <div className="ml-auto flex flex-col gap-8 pt-6 md:flex-row md:items-start" style={{
              width: "calc(6.475 * clamp(3.2rem, 8vw, 8.5rem))"
            }}>
                <p className="relative shrink-0 font-display text-2xl leading-tight text-accent md:text-4xl font-[500]" style={{
                left: "calc(0.05 * (clamp(3.2rem, 8vw, 8.5rem) - 2.25rem))",
                color: "#F2EDE3FF"
              }}>
                  关于我
                </p>
                <p className="min-w-0 flex-1 whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg" style={{
                textAlign: "left",
                color: "#F2EDE3CC"
              }}>{"\u6211\u662F\u91D1\u747E\uFF0C\u4E00\u540D\u4EA4\u4E92\u8BBE\u8BA1\u5E08\u3002\n\n\u672C\u79D1\u7684\u98CE\u666F\u56ED\u6797\u5B66\u4E60\u8BA9\u6211\u4E60\u60EF\u4ECE\u89C2\u5BDF\u751F\u6D3B\u548C\u4EBA\u4E0E\u73AF\u5883\u7684\u5173\u7CFB\u5F00\u59CB\u601D\u8003\u3002\u540E\u6765\uFF0C\u6211\u9010\u6E10\u5C06\u8FD9\u79CD\u89C2\u5BDF\u5E26\u5165\u6570\u5B57\u4E16\u754C\uFF0C\u5F00\u59CB\u5173\u6CE8\u4EBA\u4E0E\u4EA7\u54C1\u4E4B\u95F4\u7684\u8054\u7CFB\uFF0C\u4EE5\u53CA\u8BBE\u8BA1\u5982\u4F55\u5F71\u54CD\u6211\u4EEC\u65E5\u5E38\u7684\u4F53\u9A8C\u3002\n\n\u6211\u559C\u6B22\u4ECE\u770B\u4F3C\u5E73\u5E38\u7684\u7EC6\u8282\u4E2D\u53D1\u73B0\u95EE\u9898\uFF0C\u4E5F\u4EAB\u53D7\u628A\u60F3\u6CD5\u4E00\u70B9\u70B9\u53D8\u6210\u771F\u5B9E\u4F53\u9A8C\u7684\u8FC7\u7A0B\u3002\u4ECE\u7528\u6237\u7814\u7A76\u3001\u4EA4\u4E92\u4E0E\u754C\u9762\u8BBE\u8BA1\uFF0C\u5230\u63A2\u7D22 AI \u5E26\u6765\u7684\u65B0\u53EF\u80FD\uFF0C\u6211\u59CB\u7EC8\u5E0C\u671B\u8BBE\u8BA1\u4E0D\u53EA\u662F\u89E3\u51B3\u95EE\u9898\uFF0C\u4E5F\u80FD\u8BA9\u4EBA\u4E0E\u4EA7\u54C1\u4E4B\u95F4\u7684\u76F8\u5904\u53D8\u5F97\u66F4\u81EA\u7136\u3002\n\n"}</p>
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
            <ArchiveStudy index="A-01" title="Recursive Field" medium="Motion study" timecode="00:14:08" imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-orbit_f89c7082.png" imageAlt="Sculptural koi curving across a lacquer-red field" />
          </Reveal>
          <Reveal className="md:col-span-5">
            <ArchiveStudy index="A-02" title="Phase Shift" medium="Signal work" timecode="00:08:21" imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-detail_a84a9fb3.png" imageAlt="Close study of flowing teal and ivory koi fins" mediaClassName="aspect-[4/5]" />
          </Reveal>
          <div className="hidden md:col-span-3 md:block" />
          <Reveal className="md:col-span-9">
            <ArchiveStudy index="A-03" title="After Image" medium="Light study" timecode="00:11:03" imageSrc="https://cdn.enter.pro/resources/uid_100386518/koi-archive-ripple_e378eeb1.png" imageAlt="Koi silhouettes moving through dark rippling water" mediaClassName="aspect-video" />
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
          {process.map(step => <article key={step.index} className="border-t border-border py-8 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
              <span className="font-mono text-xs text-accent">[{step.index}]</span>
              <h3 className="mt-16 font-display text-3xl font-medium uppercase tracking-[-0.04em]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </article>)}
        </div>
      </div>
    </section>

    <section id="screenings" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading index="03" eyebrow="Public space" title="Screenings / installations" />
        </Reveal>
        <div className="mt-14 border-b border-border">
          {screenings.map(screening => <a key={screening.title} href="#contact" className="group grid min-h-28 items-center gap-3 border-t border-border py-5 transition-colors hover:bg-card focus-visible:bg-card focus-visible:outline-none md:grid-cols-12 md:px-5">
              <span className="font-mono text-xs text-accent md:col-span-2">2026.{screening.date}</span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">{screening.place}</span>
              <span className="font-display text-2xl uppercase tracking-[-0.03em] transition-colors group-hover:text-accent md:col-span-6 md:text-3xl">{screening.title}</span>
              <ArrowUpRight className="size-5 text-accent md:justify-self-end" />
            </a>)}
        </div>
      </div>
    </section>

    <section id="contact" className="scroll-mt-20 bg-white px-5 py-24 text-neutral-950 md:px-8 md:py-32" style={{
    backgroundColor: "#FFFFFFFF"
  }}>
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent" style={{
            fontSize: "12px"
          }}>
              联系我
            </p>
            <p className="mt-4 font-display text-3xl font-semibold uppercase tracking-[-0.04em] md:text-4xl pt-[16px]" style={{
            fontSize: "96px",
            paddingTop: "32px"
          }}>
              JINJIN
            </p>
          </div>
          <div className="flex flex-col gap-10 md:col-span-8 md:flex-row md:items-start md:justify-end md:gap-[100px]">
            <div className="md:w-fit">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={{
              fontSize: "12px"
            }}>
              电话
            </p>
            <p className="mt-3 font-display text-lg md:text-xl" style={{
              fontSize: "16px"
            }}>17361662629</p>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={{
              fontSize: "12px"
            }}>
              邮箱
            </p>
            <p className="mt-3 break-all font-display text-lg md:text-xl" style={{
              fontSize: "16px"
            }}>
              17361662629@163.com
            </p>
          </div>
          <div className="md:w-fit">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={{
              fontSize: "12px"
            }}>
              微信
            </p>
            <img src="/wechat-qr.png" alt="微信二维码" width={612} height={612} loading="lazy" className="mt-4 block w-[110px]" />
          </div>
          <div className="md:w-fit">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={{
              fontSize: "12px"
            }}>
              导航
            </p>
            <ul className="mt-4 space-y-4 font-display text-lg md:text-xl">
              <li className="text-[16px]">
                <a href="#manifesto" className="transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none text-[14px]" style={{
                  fontSize: "16px"
                }}>
                  背景
                </a>
              </li>
              <li>
                <a href="#studies" className="transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none text-[14px]" style={{
                  fontSize: "16px"
                }}>
                  作品
                </a>
              </li>
              <li>
                <a href="/" className="transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none text-[14px]" style={{
                  fontSize: "16px"
                }}>
                  返回首页
                </a>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </section>

    <footer className="technical-grid px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-[1600px] gap-10 border-t border-border pt-6 md:grid-cols-12">
        <div className="font-mono text-[11px] uppercase leading-6 tracking-[0.15em] text-muted-foreground md:col-span-4 md:col-start-9 md:text-right">
          <p className="Sans'] Sans'] font-[Montserrat]">© Created by JINJIN</p>
        </div>
      </div>
    </footer>
  </main>;
export default Index;