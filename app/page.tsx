import Link from "next/link";
import SiteHeader from "./_components/SiteHeader";
import styles from "./page.module.css";

const tools = [
  {
    href: "/onlineplayer",
    title: "在线视频播放器",
    category: "视频类",
    desc: "本地视频在线播放，支持多种格式",
    url: "/onlineplayer",
    cardClass: styles.playerCard,
    iconPath: "M20 16.5v15l12-7.5-12-7.5Z",
  },
  {
    href: "/ux_design",
    title: "UI 设计原则 Web 展示",
    category: "设计类",
    desc: "常见 UI 设计原则的可视化展示",
    url: "/ux_design",
    cardClass: styles.designCard,
    iconPath: "M15 17h18v4H15v-4Zm0 8h12v4H15v-4Zm0 8h18v4H15v-4Z",
  },
  {
    href: "/json_image",
    title: "JSON 图片提取器",
    category: "图像类",
    desc: "从 JSON 中批量提取图片地址",
    url: "/json_image",
    cardClass: styles.designCard,
    iconPath: "M10 14h28v20H10V14Zm4 4v12h20V18H14Zm3 9 4.5-5.5 3.5 4 2.5-3 4.5 4.5H17Z",
  },
  {
    href: "/image_meta",
    title: "图片导入查看台",
    category: "图像类",
    desc: "图片元信息预览与查看",
    url: "/image_meta",
    cardClass: styles.designCard,
    iconPath: "M12 14h24v20H12V14Zm4 4v12h16V18H16Zm2 9 3.5-4.5 3 3.5 2.5-3 3 4H18Zm-1-7h6v2h-6v-2Z",
  },
];

export default function Home() {
  return (
    <div className={styles.body}>
      <SiteHeader />

      <main className={styles.main}>
        <section className={styles.toolsSection} aria-label="工具列表">
          <div className={styles.toolGrid}>
            {tools.map((tool) => (
              <Link key={tool.href} className={`${styles.toolCard} ${tool.cardClass}`} href={tool.href}>
                <span className={styles.toolIcon} aria-hidden="true">
                  <svg viewBox="0 0 48 48" role="img">
                    <rect width="48" height="48" rx="12"></rect>
                    <path d={tool.iconPath}></path>
                  </svg>
                </span>
                <div className={styles.toolBody}>
                  <div className={styles.toolHead}>
                    <span className={styles.toolTitle}>{tool.title}</span>
                    <span className={styles.toolCategory}>[{tool.category}]</span>
                  </div>
                  <span className={styles.toolFav} aria-hidden="true">☆ 加入收藏</span>
                  <p className={styles.toolDesc}>{tool.desc}</p>
                  <div className={styles.toolFooter}>
                    <span className={styles.toolUrl}>{tool.url}</span>
                    <span className={styles.toolEnter}>进入</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
