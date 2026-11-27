import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { type CareerEntry } from "@/components/home/CareerTimeline";
import { CareerTunnel } from "@/components/home/CareerTunnel";
import { ParticleHero } from "@/components/home/ParticleHero";
import { StudyDeck, type Study } from "@/components/home/StudyDeck";
import { wechatQrSrc } from "@/components/home/wechatQr";
import { ParticlePortrait } from "@/components/home/ParticlePortrait";
import { SectionHeading } from "@/components/home/SectionHeading";
const background: CareerEntry[] = [{
  period: "2018.09",
  organization: "北京林业大学",
  role: "风景园林",
  kind: "教育",
  range: "2018.09 – 2022.07",
  note: "211",
  image: "/career-01-beijing-forestry.webp",
  imageAlt: "北京林业大学校园雪景，林间水景与落叶",
  detail: "在北林的四年，我投身于自然山水与古典园林，对「美」有了自己的见解；也参与了各类文体活动，为班级同学服务。"
}, {
  period: "2022.08",
  organization: "考研二战",
  role: "",
  kind: "",
  range: "2022.08 – 2023.03",
  image: "/career-02-exam-retake.webp",
  imageAlt: "雪中停泊的船只与江岸",
  detail: "本科毕业后，我在家中备考一年，但最终以一名之差再次落榜。虽然是一段失败的经历，但我也获得了很多。"
}, {
  period: "2023.08",
  organization: "甘肃鑫佳信勘测设计有限公司",
  role: "景观设计助理",
  kind: "实习",
  range: "2023.08 – 2024.02",
  image: "/career-03-gansu-survey.webp",
  imageAlt: "夜色中的城市高楼与街道",
  detail: "对于是否三战，我经过了一段时间的思考，最后决定先去实践，体验一下风景园林的实际工作流程。工作期间，我主要负责项目的平面图制作与视觉优化。"
}, {
  period: "2024.04",
  organization: "留学申请",
  role: "",
  kind: "",
  range: "2024.04 – 2024.10",
  image: "/career-04-study-abroad.webp",
  imageAlt: "暮色中的城市天际线与高楼",
  detail: "实践后，我发现风景园林所学，与实际工作所需有比较大的出入，因此产生了转专业的想法。经过一段时间的作品集准备与语言学习，拿到了莫纳什大学、悉尼大学、拉夫堡大学的offer。"
}, {
  period: "2024.11",
  organization: "万唯原创文化传播（陕西）有限公司",
  role: "新媒体运营",
  kind: "实习",
  range: "2024.11 – 2025.02",
  image: "/career-04-wanwei.webp",
  imageAlt: "秋日银杏树间的古塔",
  detail: "吸取之前实践太少的经验教训，我在等待入学期间又开始寻找实习。在万唯做了一些有关内容运营的工作：审核教辅书配套教学视频的内容，并对发现的讲解错误与教师沟通补录音频，并完成视频剪辑与内容修正。"
}, {
  period: "2025.03",
  organization: "Monash University",
  role: "交互设计",
  kind: "教育",
  range: "2025.03 – 2026.11",
  note: "QS31",
  image: "/career-05-monash.webp",
  imageAlt: "海边的礁石、灌木与远处小镇",
  detail: "在莫纳什，我学习了用户研究，交互设计和UI设计相关的知识，也选修了前端、3D建模、动画设计课程。并在最终的毕设评审中，获得了优秀毕业设计的奖项。"
}, {
  period: "2025.11",
  organization: "小红书",
  role: "体验设计",
  kind: "实习",
  range: "2025.11 – 2026.02",
  image: "/career-06-xiaohongshu.webp",
  imageAlt: "与小红书吉祥物合影",
  detail: "在小红书，我参与了社区体验设计，工作内容包括需求分析、交互设计、UI设计及设计走查，持续优化社区内的内容浏览与互动体验。具体的项目有「私信语音交互更新」「H5回流页面改版」「创作者中心笔记分析改版」「小米折叠屏适配设计」等。"
}, {
  period: "2026.06",
  organization: "合肥美的电冰箱有限公司",
  role: "UXI 设计",
  kind: "实习",
  range: "2026.06 – 2026.08",
  image: "/career-07-midea.webp",
  imageAlt: "晚霞下的厂房与城市天际线",
  detail: "在美的，我参与了冰箱产品的用户体验与视觉设计工作，具体包括冰箱显控交互及前瞻体验研究，还会配合企划、工业设计团队推进设计落地。"
}, {
  period: "2026.09",
  organization: "Converge AI\n——九坤创投",
  role: "产品设计",
  kind: "实习",
  range: "2026.09 – 2026.11",
  image: "/career-08-converge.webp",
  imageAlt: "夜色中的 TusPark 办公楼与台阶",
  detail: "在 Converge，我参与了 Covey 这款 AI 协作办公产品的搭建，也体验到了 AI Native 公司中设计工作方式的变化。设计不再只是需求的承接与执行，而是可以主动提出想法、参与产品决策，并通过Vibe Coding将设计落地，设计师的角色也因此有了更多可能。"
}];
const studies: Study[] = [{
  index: "A-01",
  title: "Recursive Field",
  medium: "Motion study",
  timecode: "00:14:08",
  imageSrc: "https://cdn.enter.pro/resources/uid_100386518/koi-archive-orbit_f89c7082.png",
  imageAlt: "Sculptural koi curving across a lacquer-red field"
}, {
  index: "A-02",
  title: "Phase Shift",
  medium: "Signal work",
  timecode: "00:08:21",
  imageSrc: "https://cdn.enter.pro/resources/uid_100386518/koi-archive-detail_a84a9fb3.png",
  imageAlt: "Close study of flowing teal and ivory koi fins"
}, {
  index: "A-03",
  title: "After Image",
  medium: "Light study",
  timecode: "00:11:03",
  imageSrc: "https://cdn.enter.pro/resources/uid_100386518/koi-archive-ripple_e378eeb1.png",
  imageAlt: "Koi silhouettes moving through dark rippling water"
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

    <section id="manifesto" className="scroll-mt-20 px-5 py-24 md:px-16 md:py-36" style={{
    paddingBottom: "90px"
  }}>
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="grid gap-12 pt-20 md:grid-cols-12">
            <div className="md:col-span-3">
              <ParticlePortrait />
            </div>
            <div className="md:col-span-9">
              <div className="ml-auto flex w-fit flex-col items-end">
                <h1 className="max-w-6xl font-display text-[clamp(3.2rem,8vw,8.5rem)] font-semibold uppercase leading-[0.84] tracking-[-0.075em] text-right" style={{
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

    <section id="process" className="scroll-mt-20 px-5 py-10 md:px-16 md:py-[4.5rem]" style={{
    paddingBottom: "26px"
  }}>
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading eyebrow="背景" heading="我的经历" />
        </Reveal>
        <CareerTunnel entries={background} />
      </div>
    </section>

    <section id="studies" className="scroll-mt-20 px-5 py-20 md:px-16 md:py-28" style={{
    paddingBottom: "220px"
  }}>
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHeading eyebrow="作品" heading="我的项目" />
        </Reveal>
        <StudyDeck studies={studies} />
      </div>
    </section>

    <section id="contact" className="on-light scroll-mt-20 bg-[#F2EDE3] px-5 py-24 text-[#140B0B] md:px-16 md:py-32" style={{
    backgroundColor: "#F2EDE3FF"
  }}>
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent" style={{
            fontSize: "12px"
          }}>
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              联系我
            </p>
            <p className="mt-4 font-display text-3xl font-semibold uppercase tracking-[-0.04em] md:text-4xl pt-[16px]" style={{
            fontSize: "96px",
            paddingTop: "32px",
            fontWeight: "800"
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
            <img src={wechatQrSrc} alt="微信二维码" width={240} height={240} className="mt-4 block w-[110px]" />
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

    <footer className="technical-grid px-5 py-12 md:px-16 md:py-16">
      <div className="mx-auto grid max-w-[1600px] gap-10 border-t border-border pt-6 md:grid-cols-12">
        <div className="font-mono text-[11px] uppercase leading-6 tracking-[0.15em] text-muted-foreground md:col-span-4 md:col-start-9 md:text-right">
          <p className="Sans'] Sans'] font-[Montserrat]">© Created by JINJIN</p>
        </div>
      </div>
    </footer>
  </main>;
export default Index;