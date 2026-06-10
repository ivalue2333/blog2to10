"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

type Mode = "encode" | "decode";

const toUrlSafe = (s: string) => s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const fromUrlSafe = (s: string) => {
  const replaced = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = replaced.length % 4;
  return pad === 0 ? replaced : replaced + "=".repeat(4 - pad);
};

function encodeBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const std = btoa(binary);
  return urlSafe ? toUrlSafe(std) : std;
}

function decodeBase64(text: string, urlSafe: boolean): string {
  const normalized = (urlSafe ? fromUrlSafe(text) : text).replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

type Result = { ok: true; output: string } | { ok: false; error: string };

function transform(input: string, mode: Mode, urlSafe: boolean): Result {
  if (!input) return { ok: true, output: "" };
  try {
    const output = mode === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe);
    return { ok: true, output };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "处理失败";
    return { ok: false, error: mode === "encode" ? `编码失败：${msg}` : `解码失败：${msg}` };
  }
}

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [input, setInput] = useState<string>("Hello, 世界 🌏");

  const result = useMemo<Result>(() => transform(input, mode, urlSafe), [input, mode, urlSafe]);

  const handleSwap = () => {
    if (!result.ok) return;
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(result.output);
  };

  const handleClear = () => setInput("");

  const handleCopy = async () => {
    if (!result.ok || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
    } catch {
      /* noop */
    }
  };

  const inputLabel = mode === "encode" ? "输入文本" : "输入 Base64";
  const outputLabel = mode === "encode" ? "Base64 结果" : "解码文本";
  const placeholder =
    mode === "encode"
      ? "输入要编码的内容，例如：Hello"
      : urlSafe
        ? "输入 URL-Safe Base64，例如：SGVsbG8"
        : "输入标准 Base64，例如：SGVsbG8=";

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="Base64 编解码" />

      <main className={styles.shell}>
        <section className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.modeSwitch} role="tablist">
              <button
                className={`${styles.modeBtn} ${mode === "encode" ? styles.modeActive : ""}`}
                onClick={() => setMode("encode")}
                type="button"
              >
                编码
              </button>
              <button
                className={`${styles.modeBtn} ${mode === "decode" ? styles.modeActive : ""}`}
                onClick={() => setMode("decode")}
                type="button"
              >
                解码
              </button>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
              />
              <span className={styles.toggleText}>URL-Safe</span>
            </label>
          </div>
          <div className={styles.toolbarRight}>
            <button className={styles.ghostBtn} type="button" onClick={handleSwap} disabled={!result.ok || !result.output}>
              结果作为输入
            </button>
            <button className={styles.ghostBtn} type="button" onClick={handleClear}>
              清空
            </button>
          </div>
        </section>

        <div className={styles.row}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{inputLabel}</h2>
              <span className={styles.meta}>{input.length} 字符</span>
            </div>
            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={placeholder}
            />
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{outputLabel}</h2>
              <div className={styles.headRight}>
                <span className={styles.meta}>{result.ok ? `${result.output.length} 字符` : ""}</span>
                <button className={styles.copyBtn} type="button" onClick={handleCopy} disabled={!result.ok || !result.output}>
                  复制
                </button>
              </div>
            </div>
            {result.ok ? (
              <textarea
                className={styles.textarea}
                value={result.output}
                readOnly
                spellCheck={false}
                placeholder="结果将显示在这里"
              />
            ) : (
              <div className={styles.errorBox}>{result.error}</div>
            )}
          </section>
        </div>

        <section className={styles.tipsCard}>
          <h2 className={styles.cardTitle}>说明</h2>
          <ul className={styles.tips}>
            <li>支持 UTF-8 字符（含中文、Emoji），自动按字节编码。</li>
            <li>开启 <code>URL-Safe</code>：编码时把 <code>+ /</code> 替换为 <code>- _</code>，并去除末尾 <code>=</code>；解码时自动还原。</li>
            <li>点击 <code>结果作为输入</code> 可在编码↔解码之间快速切换。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
