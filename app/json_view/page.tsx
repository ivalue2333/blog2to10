"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

const JsonView = dynamic(
  async () => (await import("@uiw/react-json-view")).default,
  { ssr: false, loading: () => <div className={styles.loading}>加载中...</div> }
);

const SAMPLE = {
  string: "Lorem ipsum dolor sit amet",
  integer: 42,
  float: 114.514,
  boolean: true,
  null: null,
  array: [1, 2, 3, "test"],
  nested: {
    name: "Alice",
    age: 30,
    tags: ["dev", "design"],
    meta: { active: true, score: 99.5 },
  },
};

const customTheme = {
  "--w-rjv-color": "#17324d",
  "--w-rjv-key-string": "#1f9d63",
  "--w-rjv-key-number": "#1f9d63",
  "--w-rjv-background-color": "#ffffff",
  "--w-rjv-line-color": "rgba(43, 182, 115, 0.18)",
  "--w-rjv-arrow-color": "#2bb673",
  "--w-rjv-edit-color": "#06b6d4",
  "--w-rjv-info-color": "#9ca3af",
  "--w-rjv-update-color": "#2bb673",
  "--w-rjv-copied-color": "#2bb673",
  "--w-rjv-copied-success-color": "#1f9d63",
  "--w-rjv-curlybraces-color": "#6b7780",
  "--w-rjv-colon-color": "#6b7780",
  "--w-rjv-brackets-color": "#6b7780",
  "--w-rjv-ellipsis-color": "#06b6d4",
  "--w-rjv-quotes-color": "#1f9d63",
  "--w-rjv-quotes-string-color": "#0d7a4d",
  "--w-rjv-type-string-color": "#0d7a4d",
  "--w-rjv-type-int-color": "#06b6d4",
  "--w-rjv-type-float-color": "#06b6d4",
  "--w-rjv-type-bigint-color": "#06b6d4",
  "--w-rjv-type-boolean-color": "#2bb673",
  "--w-rjv-type-date-color": "#06b6d4",
  "--w-rjv-type-url-color": "#06b6d4",
  "--w-rjv-type-null-color": "#9ca3af",
  "--w-rjv-type-nan-color": "#ef4444",
  "--w-rjv-type-undefined-color": "#9ca3af",
} as const;

type ParseResult =
  | { ok: true; value: unknown; pretty: string }
  | { ok: false; error: string };

function parseInput(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "请输入 JSON 内容" };
  }
  try {
    const value = JSON.parse(trimmed);
    return { ok: true, value, pretty: JSON.stringify(value, null, 2) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JSON 解析失败";
    return { ok: false, error: msg };
  }
}

export default function JsonViewPage() {
  const [input, setInput] = useState<string>(JSON.stringify(SAMPLE, null, 2));
  const [collapsed, setCollapsed] = useState<number | false>(2);

  const parsed = useMemo<ParseResult>(() => parseInput(input), [input]);

  const handleFormat = () => {
    if (parsed.ok) setInput(parsed.pretty);
  };

  const handleMinify = () => {
    if (parsed.ok) setInput(JSON.stringify(parsed.value));
  };

  const handleClear = () => setInput("");

  const handleSample = () => setInput(JSON.stringify(SAMPLE, null, 2));

  const handleCopy = async () => {
    if (!parsed.ok) return;
    try {
      await navigator.clipboard.writeText(parsed.pretty);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="JSON 查看器" />

      <main className={styles.shell}>
        <section className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.primaryBtn} type="button" onClick={handleFormat} disabled={!parsed.ok}>
              格式化
            </button>
            <button className={styles.ghostBtn} type="button" onClick={handleMinify} disabled={!parsed.ok}>
              压缩
            </button>
            <button className={styles.ghostBtn} type="button" onClick={handleCopy} disabled={!parsed.ok}>
              复制
            </button>
            <button className={styles.ghostBtn} type="button" onClick={handleSample}>
              示例
            </button>
            <button className={styles.ghostBtn} type="button" onClick={handleClear}>
              清空
            </button>
          </div>
          <div className={styles.toolbarRight}>
            <span className={styles.collapseLabel}>展开层级：</span>
            <div className={styles.collapseGroup} role="tablist">
              {[1, 2, 3, 5].map((lv) => (
                <button
                  key={lv}
                  className={`${styles.collapseBtn} ${collapsed === lv ? styles.collapseActive : ""}`}
                  type="button"
                  onClick={() => setCollapsed(lv)}
                >
                  {lv}
                </button>
              ))}
              <button
                className={`${styles.collapseBtn} ${collapsed === false ? styles.collapseActive : ""}`}
                type="button"
                onClick={() => setCollapsed(false)}
              >
                全部
              </button>
            </div>
          </div>
        </section>

        <div className={styles.row}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>输入 JSON</h2>
              {!parsed.ok ? <span className={styles.errorTag}>{parsed.error}</span> : <span className={styles.okTag}>已解析</span>}
            </div>
            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder='例如：{"name": "Alice", "age": 30}'
            />
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>可视化</h2>
            </div>
            <div className={styles.viewer}>
              {parsed.ok ? (
                <JsonView
                  value={parsed.value as object}
                  collapsed={collapsed}
                  displayDataTypes={false}
                  enableClipboard
                  style={customTheme as React.CSSProperties}
                />
              ) : (
                <div className={styles.placeholder}>解析成功后在此预览</div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.tipsCard}>
          <h2 className={styles.cardTitle}>说明</h2>
          <ul className={styles.tips}>
            <li>左侧粘贴 JSON，右侧实时渲染为可折叠树。</li>
            <li>点击 <code>格式化</code> 美化缩进，<code>压缩</code> 去除空白。</li>
            <li>切换 <code>展开层级</code> 控制初始展开深度。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
