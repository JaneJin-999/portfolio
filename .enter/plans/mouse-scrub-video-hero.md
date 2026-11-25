# 抽象动态影像完整页面

## Context
在已完成的鼠标拖动式纯视频 Hero 基础上，将首页扩展为完整的“实验性数字艺术展览 / 动态影像档案”。首屏继续保持纯视频，不叠加文字、导航、按钮或装饰；首屏以下通过近黑档案背景、酸性黄绿色信号色、扫描线纹理、非对称栅格和克制的滚动动效，延续视频的抽象艺术与视觉实验气质。

## 推荐方案
- 保留现有视频资源、`SENSITIVITY = 0.8` 和 `seeked` 队列逻辑不变，将其抽取为独立 `VideoHero` 组件，避免完整页面继续堆积在一个文件中。
- Hero 之后增加独立内容流：内容导航、Manifesto、Selected Studies、Process、Screenings、Contact CTA 与档案式 Footer；全部为静态展示内容，不引入后端、虚假提交或额外媒体资源。
- 使用短促的英文艺术文案和编号系统（`01 / 02 / 03`），构建“影像研究档案”叙事；视觉图块由语义色、网格、扫描线、边框和排版构成，不使用常规 SaaS 卡片或模板化渐变。
- 使用现有 `framer-motion` 实现一次性进入视口揭示，并尊重 `prefers-reduced-motion`；交互链接保持清晰的 hover、focus-visible 和移动端触控尺寸。
- 将页面从当前禁止滚动改为仅隐藏横向溢出，同时保持 Hero 为 `100svh`；桌面使用 12 栅格与非对称布局，移动端转为单列并保持内容节奏。

## 页面结构
1. **Video Hero**：纯视频、全视口、无覆盖层，保留鼠标横向时间轴交互。
2. **Archive Navigation**：位于 Hero 之后，不覆盖视频；包含站点标识与锚点链接。
3. **Manifesto**：大字号声明与作品元数据，形成从影像到档案文本的过渡。
4. **Selected Studies**：三组不同构图比例的实验作品图块，以 CSS 图形、编号和时间码表现视觉研究。
5. **Process**：三阶段创作方法，采用细线分隔和工程化标注。
6. **Screenings**：简洁的展映/装置记录列表，强化完整艺术项目语境。
7. **Contact CTA + Footer**：使用可用的 `mailto:` 联系入口和分栏档案信息，不伪造表单提交。

## 关键文件
- `src/components/home/VideoHero.tsx` — 从首页抽取并复用现有视频与防 seek-flooding 逻辑。
- `src/components/home/SectionHeading.tsx` — 统一编号、标题与辅助标签的区块标题。
- `src/components/home/ArchiveStudy.tsx` — 可复用的实验作品图块及可访问交互状态。
- `src/pages/Index.tsx` — 组合完整首页结构与静态艺术内容。
- `src/index.css` — 近黑/信号色语义 tokens、扫描线与网格纹理、全局滚动和 reduced-motion 规则。
- `tailwind.config.ts` — 将显示字体、等宽字体及必要动画映射到设计系统。

## Implementation checklist
- [ ] 将 `src/pages/Index.tsx` 中现有 Hero 及鼠标 seek 队列逻辑原样抽取到 `src/components/home/VideoHero.tsx`。
- [ ] 确保 `VideoHero` 仍使用本地 MP4、`muted`、`playsInline`、`preload="auto"`，且不添加 autoplay、controls 或覆盖层。
- [ ] 在 `src/index.css` 中把核心语义色更新为近黑背景、近白文字和 WCAG AA 的酸性黄绿色信号色。
- [ ] 在 `src/index.css` 中加入可复用的扫描线、技术网格与细边框视觉工具，并为 reduced-motion 提供静态降级。
- [ ] 在 `tailwind.config.ts` 中增加 display/mono 字体映射，不使用组件内硬编码字体或直接色值。
- [ ] 新建 `src/components/home/SectionHeading.tsx`，统一所有内容区编号与标题层级。
- [ ] 新建 `src/components/home/ArchiveStudy.tsx`，支持不同比例、编号、标题、媒介与时间码，且具有 hover/focus-visible 状态。
- [ ] 重构 `src/pages/Index.tsx`，依次组合 Hero、内容导航、Manifesto、Selected Studies、Process、Screenings、CTA 与 Footer。
- [ ] 为 Hero 下方导航和 CTA 使用真实锚点及 `mailto:` 行为，不增加无后端的虚假交互。
- [ ] 将 `body` 从 `overflow: hidden` 改为允许纵向滚动并阻止横向溢出。
- [ ] 使用现有 `framer-motion` 为内容区添加一次性滚动揭示，同时确保 reduced-motion 用户直接看到最终状态。
- [ ] 为桌面 12 栅格和移动端单列分别设置间距、字号、图块比例与导航折行规则。

## Verification checklist
- [ ] 运行 `pnpm check`，确认 ESLint 与 TypeScript 无错误。
- [ ] 运行 `pnpm run build`，确认完整页面和本地 MP4 均可打包。
- [ ] 默认加载时确认视频仍暂停、静音、无控件且 Hero 上方没有任何 DOM 覆盖内容。
- [ ] 在桌面向右/向左移动鼠标，确认视频继续前进/后退，快速移动时仍只保留最新待处理 seek。
- [ ] 点击 Hero 下方各导航锚点，确认定位到对应区块且不遮挡标题。
- [ ] 使用键盘 Tab 检查导航、作品图块和联系链接均有清晰 focus-visible 状态。
- [ ] 开启 reduced-motion，确认滚动内容不依赖位移动画即可读取。
- [ ] 在 `desktop_1280` 截图检查 Hero 纯净、非对称栅格、信号色对比和完整页面节奏。
- [ ] 在 `mobile_390` 截图检查 Hero 裁切、单列内容、导航折行、无横向滚动及最小 44px 触控区域。
- [ ] 检查页面底部 CTA 使用真实 `mailto:`，不存在伪成功、伪订阅或未实现按钮。
