"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

type Law = {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  tags: string[];
  takeaways: string[];
  tips: string[];
  sourceUrl: string;
};

const laws: Law[] = [
  {
    slug: "aesthetic-usability-effect",
    titleZh: "审美可用性效应",
    titleEn: "Aesthetic-Usability Effect",
    summaryZh: "用户往往会把更美观的设计感知为更容易使用的设计。",
    tags: ["感知", "视觉", "信任"],
    takeaways: ["美感会提升用户对产品的第一印象。", "漂亮的界面能提高用户容忍小问题的意愿。", "视觉质量不能替代真实的可用性。"],
    tips: ["用一致的间距、字体和层级建立专业感。", "把关键流程做顺，再用视觉细节增强信任。"],
    sourceUrl: "https://lawsofux.com/aesthetic-usability-effect/",
  },
  {
    slug: "choice-overload",
    titleZh: "选择过载",
    titleEn: "Choice Overload",
    summaryZh: "当选项过多时，人们容易被压垮，决策质量和行动意愿都会下降。",
    tags: ["决策", "信息架构", "转化"],
    takeaways: ["选择越多不一定越自由。", "过多选项会增加比较成本。", "用户可能因此推迟或放弃决定。"],
    tips: ["优先给出推荐选项。", "把选项分组、分步或渐进展示。"],
    sourceUrl: "https://lawsofux.com/choice-overload/",
  },
  {
    slug: "chunking",
    titleZh: "组块化",
    titleEn: "Chunking",
    summaryZh: "把零散信息拆分并归组为有意义的整体，可以帮助用户更快理解和记忆。",
    tags: ["记忆", "内容", "信息架构"],
    takeaways: ["人更容易处理成组的信息。", "分组能降低阅读压力。", "组块需要基于意义，而不是随意切分。"],
    tips: ["表单按主题分段。", "长内容使用标题、卡片和列表组织。"],
    sourceUrl: "https://lawsofux.com/chunking/",
  },
  {
    slug: "cognitive-bias",
    titleZh: "认知偏差",
    titleEn: "Cognitive Bias",
    summaryZh: "认知偏差是判断与理性思考中的系统性误差，会影响人们理解世界和做决定。",
    tags: ["认知", "决策", "心理"],
    takeaways: ["用户并不总是理性决策。", "默认值、文案和排序会影响判断。", "设计应避免利用偏差误导用户。"],
    tips: ["让重要决策透明可逆。", "避免暗黑模式和诱导性默认选项。"],
    sourceUrl: "https://lawsofux.com/cognitive-bias/",
  },
  {
    slug: "cognitive-load",
    titleZh: "认知负荷",
    titleEn: "Cognitive Load",
    summaryZh: "认知负荷是理解并操作界面所需的心理资源总量。",
    tags: ["认知", "可用性", "效率"],
    takeaways: ["复杂界面会消耗更多注意力。", "负荷过高会导致出错和放弃。", "清晰的结构比堆功能更重要。"],
    tips: ["一次只让用户处理一个主要任务。", "用默认值、说明和即时反馈减少思考成本。"],
    sourceUrl: "https://lawsofux.com/cognitive-load/",
  },
  {
    slug: "doherty-threshold",
    titleZh: "多尔蒂阈值",
    titleEn: "Doherty Threshold",
    summaryZh: "当系统响应速度低于约 400ms 时，人与计算机能保持流畅互动，生产力会显著提升。",
    tags: ["性能", "反馈", "效率"],
    takeaways: ["响应速度直接影响沉浸感。", "等待会打断用户思路。", "慢操作也需要及时反馈。"],
    tips: ["关键交互尽量在 400ms 内响应。", "为耗时任务提供骨架屏、进度或状态提示。"],
    sourceUrl: "https://lawsofux.com/doherty-threshold/",
  },
  {
    slug: "fittss-law",
    titleZh: "费茨定律",
    titleEn: "Fitts’s Law",
    summaryZh: "获取目标所需时间取决于目标距离和目标大小：越近越大越容易点到。",
    tags: ["交互", "布局", "移动端"],
    takeaways: ["小按钮和远距离目标会降低效率。", "常用操作应更大、更靠近用户注意区域。", "触控界面尤其需要足够点击面积。"],
    tips: ["让主要按钮显著且易触达。", "避免把危险操作放在常用操作旁边。"],
    sourceUrl: "https://lawsofux.com/fittss-law/",
  },
  {
    slug: "flow",
    titleZh: "心流",
    titleEn: "Flow",
    summaryZh: "心流是人在活动中高度专注、完全投入并从过程中获得愉悦的心理状态。",
    tags: ["体验", "动机", "沉浸"],
    takeaways: ["清晰目标和即时反馈有助于心流。", "任务难度需要匹配用户能力。", "频繁打断会破坏沉浸体验。"],
    tips: ["减少无关弹窗和跳转。", "把复杂任务设计成连续、可感知进展的步骤。"],
    sourceUrl: "https://lawsofux.com/flow/",
  },
  {
    slug: "goal-gradient-effect",
    titleZh: "目标梯度效应",
    titleEn: "Goal-Gradient Effect",
    summaryZh: "越接近目标，人们越倾向于加速行动。",
    tags: ["动机", "转化", "进度"],
    takeaways: ["可见进度能提高完成意愿。", "临近完成时用户更愿意投入。", "模糊目标会削弱动力。"],
    tips: ["用进度条、步骤数或完成度提示。", "在关键节点强调“还差一步”。"],
    sourceUrl: "https://lawsofux.com/goal-gradient-effect/",
  },
  {
    slug: "hicks-law",
    titleZh: "希克定律",
    titleEn: "Hick’s Law",
    summaryZh: "决策所需时间会随着选项数量和复杂度增加而增加。",
    tags: ["决策", "导航", "效率"],
    takeaways: ["复杂选择会拖慢行动。", "过多入口会让用户犹豫。", "重要路径需要被优先呈现。"],
    tips: ["减少同屏同级选项。", "用分类、搜索和默认推荐降低决策压力。"],
    sourceUrl: "https://lawsofux.com/hicks-law/",
  },
  {
    slug: "jakobs-law",
    titleZh: "雅各布定律",
    titleEn: "Jakob’s Law",
    summaryZh: "用户大多数时间都在使用其他网站，因此更希望你的网站按他们熟悉的方式工作。",
    tags: ["习惯", "可用性", "模式"],
    takeaways: ["熟悉模式能降低学习成本。", "创新交互需要付出理解成本。", "用户会把其他产品经验迁移到你的产品。"],
    tips: ["常见功能遵循行业惯例。", "只有在收益明确时才打破用户预期。"],
    sourceUrl: "https://lawsofux.com/jakobs-law/",
  },
  {
    slug: "law-of-common-region",
    titleZh: "共同区域定律",
    titleEn: "Law of Common Region",
    summaryZh: "如果元素共享一个明确边界区域，人们会倾向于把它们看成一组。",
    tags: ["格式塔", "布局", "分组"],
    takeaways: ["边框、背景和容器能表达关系。", "区域边界比单纯距离更强。", "分组错误会造成理解偏差。"],
    tips: ["用卡片承载同一任务的信息。", "不同模块之间保持清晰边界。"],
    sourceUrl: "https://lawsofux.com/law-of-common-region/",
  },
  {
    slug: "law-of-proximity",
    titleZh: "接近定律",
    titleEn: "Law of Proximity",
    summaryZh: "彼此靠近的对象更容易被感知为同一组。",
    tags: ["格式塔", "布局", "分组"],
    takeaways: ["距离是表达关系的基础工具。", "相关元素应靠近，无关元素应分开。", "间距混乱会削弱层级。"],
    tips: ["标签与输入框保持近距离。", "模块之间使用更大的外间距。"],
    sourceUrl: "https://lawsofux.com/law-of-proximity/",
  },
  {
    slug: "law-of-pragnanz",
    titleZh: "简洁定律",
    titleEn: "Law of Prägnanz",
    summaryZh: "人们会把模糊或复杂图形理解为尽可能简单的形式，因为这需要更少认知努力。",
    tags: ["格式塔", "认知", "视觉"],
    takeaways: ["用户会主动寻找简单解释。", "复杂视觉容易被误读。", "清晰轮廓能提升识别效率。"],
    tips: ["图标和图形保持简洁可辨。", "避免用过度装饰承载关键信息。"],
    sourceUrl: "https://lawsofux.com/law-of-pr%C3%A4gnanz/",
  },
  {
    slug: "law-of-similarity",
    titleZh: "相似定律",
    titleEn: "Law of Similarity",
    summaryZh: "视觉上相似的元素会被人眼感知为一组，即使它们彼此分离。",
    tags: ["格式塔", "视觉", "组件"],
    takeaways: ["相同样式会暗示相同功能。", "不同功能不应长得太像。", "一致性会建立可预测性。"],
    tips: ["同类按钮保持一致视觉语言。", "用颜色、形状区分不同状态和风险。"],
    sourceUrl: "https://lawsofux.com/law-of-similarity/",
  },
  {
    slug: "law-of-uniform-connectedness",
    titleZh: "统一连接定律",
    titleEn: "Law of Uniform Connectedness",
    summaryZh: "被视觉连接起来的元素，会比没有连接的元素更容易被认为相关。",
    tags: ["格式塔", "流程", "关系"],
    takeaways: ["线、箭头和连接器能表达关系。", "连接关系通常强于相似或接近。", "错误连接会误导流程理解。"],
    tips: ["流程图、步骤条和树结构用连接强调顺序。", "减少无意义装饰线，避免制造假关系。"],
    sourceUrl: "https://lawsofux.com/law-of-uniform-connectedness/",
  },
  {
    slug: "mental-model",
    titleZh: "心智模型",
    titleEn: "Mental Model",
    summaryZh: "心智模型是用户基于既有认知，对系统如何运作形成的压缩理解。",
    tags: ["认知", "习惯", "学习"],
    takeaways: ["用户会按自己的理解预测系统行为。", "心智模型不匹配会导致困惑。", "优秀设计能贴合或逐步修正预期。"],
    tips: ["用用户熟悉的语言命名功能。", "在新概念出现时给出示例和反馈。"],
    sourceUrl: "https://lawsofux.com/mental-model/",
  },
  {
    slug: "millers-law",
    titleZh: "米勒定律",
    titleEn: "Miller’s Law",
    summaryZh: "普通人在工作记忆中通常只能保持 7 个左右的信息单元。",
    tags: ["记忆", "信息架构", "认知"],
    takeaways: ["短时记忆容量有限。", "过长列表会变得难以比较。", "组块化可以扩展有效记忆容量。"],
    tips: ["导航项和关键选项控制数量。", "把长列表分组、分页或提供搜索。"],
    sourceUrl: "https://lawsofux.com/millers-law/",
  },
  {
    slug: "occams-razor",
    titleZh: "奥卡姆剃刀",
    titleEn: "Occam’s Razor",
    summaryZh: "在多个解释同样有效时，应优先选择假设最少、最简单的那个。",
    tags: ["简化", "决策", "产品"],
    takeaways: ["复杂方案不一定更好。", "多余功能会增加维护和理解成本。", "简化需要保留核心价值。"],
    tips: ["为每个功能保留明确存在理由。", "先解决主要场景，再扩展边缘能力。"],
    sourceUrl: "https://lawsofux.com/occams-razor/",
  },
  {
    slug: "paradox-of-the-active-user",
    titleZh: "主动用户悖论",
    titleEn: "Paradox of the Active User",
    summaryZh: "用户通常不会先读说明书，而是马上开始使用软件。",
    tags: ["学习", "引导", "可用性"],
    takeaways: ["用户更偏好边做边学。", "过长说明常被忽略。", "界面本身应承担引导责任。"],
    tips: ["把帮助嵌入任务现场。", "用空状态、示例和即时提示替代长文档。"],
    sourceUrl: "https://lawsofux.com/paradox-of-the-active-user/",
  },
  {
    slug: "pareto-principle",
    titleZh: "帕累托原则",
    titleEn: "Pareto Principle",
    summaryZh: "许多事件中，大约 80% 的结果来自 20% 的原因。",
    tags: ["优先级", "产品", "效率"],
    takeaways: ["少数关键功能贡献大部分价值。", "资源应优先投入高影响场景。", "长尾需求需要谨慎评估成本。"],
    tips: ["通过数据识别核心用户路径。", "优先优化最高频、最高价值操作。"],
    sourceUrl: "https://lawsofux.com/pareto-principle/",
  },
  {
    slug: "parkinsons-law",
    titleZh: "帕金森定律",
    titleEn: "Parkinson’s Law",
    summaryZh: "任务会膨胀，直到占满所有可用时间。",
    tags: ["效率", "任务", "时间"],
    takeaways: ["宽松期限会让任务变复杂。", "无边界流程容易拖延。", "时间限制能促使聚焦。"],
    tips: ["把任务拆成短周期里程碑。", "为关键流程设置明确时限和完成标准。"],
    sourceUrl: "https://lawsofux.com/parkinsons-law/",
  },
  {
    slug: "peak-end-rule",
    titleZh: "峰终定律",
    titleEn: "Peak-End Rule",
    summaryZh: "人们对一段体验的判断，主要取决于最强烈的时刻和结束时的感受。",
    tags: ["记忆", "体验", "情绪"],
    takeaways: ["用户记住的不是平均体验。", "高峰和结尾会强烈影响评价。", "糟糕结尾可能抵消前面的努力。"],
    tips: ["优化关键成功时刻。", "让流程结束页明确、积极且可继续行动。"],
    sourceUrl: "https://lawsofux.com/peak-end-rule/",
  },
  {
    slug: "postels-law",
    titleZh: "波斯特尔法则",
    titleEn: "Postel’s Law",
    summaryZh: "对输入保持宽容，对输出保持严格。",
    tags: ["表单", "容错", "工程"],
    takeaways: ["系统应能理解用户的自然输入。", "输出需要稳定、清晰和可预测。", "容错能减少挫败感。"],
    tips: ["自动格式化手机号、空格和大小写。", "错误提示说明如何修正，而不是只说失败。"],
    sourceUrl: "https://lawsofux.com/postels-law/",
  },
  {
    slug: "selective-attention",
    titleZh: "选择性注意",
    titleEn: "Selective Attention",
    summaryZh: "人们通常只会关注环境中与当前目标相关的一部分刺激。",
    tags: ["注意力", "视觉", "转化"],
    takeaways: ["用户会忽略与目标无关的信息。", "视觉噪声会争夺注意力。", "重点越多，重点越少。"],
    tips: ["每屏只突出一个主要行动。", "用对比、位置和留白引导注意。"],
    sourceUrl: "https://lawsofux.com/selective-attention/",
  },
  {
    slug: "serial-position-effect",
    titleZh: "序列位置效应",
    titleEn: "Serial Position Effect",
    summaryZh: "用户更容易记住一组内容中的开头和结尾部分。",
    tags: ["记忆", "内容", "导航"],
    takeaways: ["中间信息最容易被遗忘。", "首尾位置适合放关键内容。", "长序列需要额外结构支持。"],
    tips: ["把重要导航项放在开头或结尾。", "在长流程中重复关键提示。"],
    sourceUrl: "https://lawsofux.com/serial-position-effect/",
  },
  {
    slug: "teslers-law",
    titleZh: "泰斯勒定律",
    titleEn: "Tesler’s Law",
    summaryZh: "任何系统都有一定无法消除的复杂度，也被称为复杂度守恒定律。",
    tags: ["复杂度", "产品", "系统"],
    takeaways: ["复杂度不能无限减少，只能被转移。", "产品要决定由系统承担还是用户承担。", "过度简化可能隐藏必要控制。"],
    tips: ["让系统承担可自动处理的复杂度。", "为高级用户保留必要的可控性。"],
    sourceUrl: "https://lawsofux.com/teslers-law/",
  },
  {
    slug: "von-restorff-effect",
    titleZh: "冯·雷斯托夫效应",
    titleEn: "Von Restorff Effect",
    summaryZh: "当多个相似对象同时出现时，与众不同的那个最容易被记住。",
    tags: ["注意力", "视觉", "记忆"],
    takeaways: ["差异会吸引注意。", "突出元素适合承载关键行动。", "过多突出会互相抵消。"],
    tips: ["只让最重要的 CTA 使用强调色。", "用尺寸、颜色或形状制造有意义的差异。"],
    sourceUrl: "https://lawsofux.com/von-restorff-effect/",
  },
  {
    slug: "working-memory",
    titleZh: "工作记忆",
    titleEn: "Working Memory",
    summaryZh: "工作记忆是临时保存并处理当前任务所需信息的认知系统。",
    tags: ["记忆", "认知", "任务"],
    takeaways: ["用户无法长时间记住大量上下文。", "跨步骤任务容易造成遗忘。", "界面应帮助用户保存状态。"],
    tips: ["在多步骤流程中保留摘要。", "避免要求用户记住上一页的信息。"],
    sourceUrl: "https://lawsofux.com/working-memory/",
  },
  {
    slug: "zeigarnik-effect",
    titleZh: "蔡格尼克效应",
    titleEn: "Zeigarnik Effect",
    summaryZh: "人们比已完成任务更容易记住未完成或被打断的任务。",
    tags: ["记忆", "任务", "动机"],
    takeaways: ["未完成状态会留在脑中。", "清晰的待办状态能促使回访。", "过多未完成任务也会造成压力。"],
    tips: ["保存草稿并提示用户继续。", "用进度和提醒帮助用户恢复上下文。"],
    sourceUrl: "https://lawsofux.com/zeigarnik-effect/",
  },
];

const ALL_TAG = "全部";

export default function UxDesignPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);
  const [selectedSlug, setSelectedSlug] = useState<string>(laws[0].slug);

  const tags = useMemo(() => [ALL_TAG, ...Array.from(new Set(laws.flatMap((law) => law.tags)))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return laws.filter((law) => {
      const text = [law.titleZh, law.titleEn, law.summaryZh, law.tags.join(" "), law.takeaways.join(" "), law.tips.join(" ")]
        .join(" ")
        .toLowerCase();
      const hitQuery = text.includes(q);
      const hitTag = activeTag === ALL_TAG || law.tags.includes(activeTag);
      return hitQuery && hitTag;
    });
  }, [query, activeTag]);

  const selectedLaw = laws.find((l) => l.slug === selectedSlug) || laws[0];
  const selectedNumber = laws.findIndex((l) => l.slug === selectedLaw.slug) + 1;
  const related = laws
    .filter((law) => law.slug !== selectedLaw.slug && law.tags.some((tag) => selectedLaw.tags.includes(tag)))
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="UI 设计原则 Web 展示" />

      <main className={styles.main}>
        <section className={styles.toolbar} aria-label="搜索与筛选">
          <label className={styles.searchBox}>
            <span>搜索规律</span>
            <input
              type="search"
              placeholder="输入中文、英文、标签或关键词..."
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className={styles.tagFilters} aria-label="标签筛选">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`${styles.tagChip} ${tag === activeTag ? styles.active : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.contentShell}>
          <section className={styles.listPanel}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>全部规律</p>
              <h2>UX 规律卡片</h2>
            </div>
            <p className={styles.resultCount}>
              当前显示 {filtered.length} / {laws.length} 条
            </p>
            <div className={styles.lawGrid} aria-live="polite">
              {filtered.map((law) => {
                const idx = laws.findIndex((l) => l.slug === law.slug) + 1;
                return (
                  <button
                    key={law.slug}
                    type="button"
                    className={`${styles.lawCard} ${law.slug === selectedSlug ? styles.active : ""}`}
                    onClick={() => setSelectedSlug(law.slug)}
                  >
                    <small>
                      {String(idx).padStart(2, "0")} · {law.titleEn}
                    </small>
                    <h3>{law.titleZh}</h3>
                    <p>{law.summaryZh}</p>
                    <span className={styles.tagRow}>
                      {law.tags.map((tag) => (
                        <span key={tag} className={styles.miniTag}>
                          {tag}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && <p className={styles.emptyState}>没有找到匹配内容，换个关键词试试。</p>}
          </section>

          <aside className={styles.detailPanel} aria-label="规律详情">
            <article className={styles.detailInner}>
              <span className={styles.number}>{String(selectedNumber).padStart(2, "0")}</span>
              <p className={styles.eyebrow}>{selectedLaw.titleEn}</p>
              <h2>{selectedLaw.titleZh}</h2>
              <p className={styles.detailSummary}>{selectedLaw.summaryZh}</p>
              <div className={styles.detailBlock}>
                <h4>怎么应用</h4>
                <ul>
                  {selectedLaw.tips.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.detailBlock}>
                <h4>相关规律</h4>
                <div className={styles.relatedList}>
                  {related.map((item) => (
                    <button key={item.slug} type="button" onClick={() => setSelectedSlug(item.slug)}>
                      {item.titleZh}
                    </button>
                  ))}
                </div>
              </div>
              <a className={styles.sourceLink} href={selectedLaw.sourceUrl} target="_blank" rel="noreferrer">
                阅读英文原文 →
              </a>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
