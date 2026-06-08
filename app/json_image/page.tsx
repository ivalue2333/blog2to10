"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type ImageItem = {
  sourceType: "值" | "键";
  path: string;
  url: string;
};

type Status = { tone: "default" | "success" | "error"; message: string };

const sampleJson = {
  cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  user: {
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    gallery: [
      {
        title: "banner",
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      },
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    ],
  },
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80": "键本身如果是 URL，也会被识别为图片",
};

const urlPattern = /^https?:\/\/\S+$/i;

function normalizePotentialUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^[`'"]+|[`'"]+$/g, "").trim();
}

function isImageUrl(value: unknown): boolean {
  return urlPattern.test(normalizePotentialUrl(value));
}

function collectImageUrls(input: unknown, currentPath = "$", bucket: ImageItem[] = []): ImageItem[] {
  if (isImageUrl(input)) {
    bucket.push({ sourceType: "值", path: currentPath, url: normalizePotentialUrl(input) });
    return bucket;
  }
  if (Array.isArray(input)) {
    input.forEach((item, index) => collectImageUrls(item, `${currentPath}[${index}]`, bucket));
    return bucket;
  }
  if (input && typeof input === "object") {
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      const nextPath = `${currentPath}.${key}`;
      if (isImageUrl(key)) {
        bucket.push({ sourceType: "键", path: `${currentPath}.{${key}}`, url: normalizePotentialUrl(key) });
      }
      collectImageUrls(value, nextPath, bucket);
    });
  }
  return bucket;
}

function guessFormat(url: string, contentType = ""): string {
  if (contentType.startsWith("image/")) {
    return contentType.slice(6).split(";")[0].toUpperCase();
  }
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop();
    if (extension && extension !== pathname) return extension.toUpperCase();
  } catch {
    return "未知";
  }
  return "未知";
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "--";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const digits = value >= 100 || index === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[index]}`;
}

type ImageCardProps = { item: ImageItem };

function ImageCard({ item }: ImageCardProps) {
  const [width, setWidth] = useState("--");
  const [height, setHeight] = useState("--");
  const [size, setSize] = useState("--");
  const [format, setFormat] = useState(guessFormat(item.url));
  const [failed, setFailed] = useState(false);

  const handleLoad = useCallback(
    async (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setWidth(`${img.naturalWidth}px`);
      setHeight(`${img.naturalHeight}px`);
      setFailed(false);
      try {
        const response = await fetch(item.url, { mode: "cors" });
        if (!response.ok) return;
        const blob = await response.blob();
        setSize(formatBytes(blob.size));
        setFormat(guessFormat(item.url, blob.type || response.headers.get("content-type") || ""));
      } catch {
        setFormat(guessFormat(item.url));
      }
    },
    [item.url]
  );

  return (
    <article className={styles.imageCard} title={`${item.path}\n${item.url}`}>
      <div className={styles.imageFrame}>
        {failed ? (
          <div className={styles.imageFallback}>下载失败</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.previewImage}
            src={item.url}
            alt="JSON 中解析出的图片"
            loading="lazy"
            onLoad={handleLoad}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className={styles.metaStats} aria-label="图片信息">
        <div className={styles.statItem}>
          <span>宽</span>
          <strong>{width}</strong>
        </div>
        <div className={styles.statItem}>
          <span>高</span>
          <strong>{height}</strong>
        </div>
        <div className={styles.statItem}>
          <span>大小</span>
          <strong>{size}</strong>
        </div>
        <div className={styles.statItem}>
          <span>格式</span>
          <strong>{format}</strong>
        </div>
      </div>
    </article>
  );
}

export default function JsonImagePage() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [status, setStatus] = useState<Status>({ tone: "default", message: "等待输入 JSON 内容。" });
  const [parsed, setParsed] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const parseJson = useCallback((raw: string) => {
    const rawText = raw.trim();
    if (!rawText) {
      setImages([]);
      setParsed(false);
      setStatus({ tone: "default", message: "请输入 JSON 内容后再提取。" });
      return;
    }
    try {
      const parsedObj = JSON.parse(rawText);
      const collected = collectImageUrls(parsedObj);
      setImages(collected);
      setParsed(true);
      setStatus({ tone: "success", message: `解析成功，已找到 ${collected.length} 个图片地址。` });
    } catch (error) {
      setImages([]);
      setParsed(false);
      const msg = error instanceof Error ? error.message : String(error);
      setStatus({ tone: "error", message: `JSON 解析失败：${msg}` });
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => parseJson(text), 250);
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [text, parseJson]);

  const fillExample = () => {
    setText(JSON.stringify(sampleJson, null, 2));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      parseJson(text);
    }
  };

  const galleryClass = useMemo(() => {
    const cols = Math.min(3, Math.max(1, images.length || 1));
    const map: Record<number, string> = { 1: styles.galleryColumns1, 2: styles.galleryColumns2, 3: "" };
    return `${styles.gallery} ${map[cols] || ""}`.trim();
  }, [images.length]);

  const statusClass = `${styles.statusCard} ${
    status.tone === "success" ? styles.success : status.tone === "error" ? styles.error : ""
  }`;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.editorPanel} aria-label="JSON 输入区">
          <div className={styles.panelHead}>
            <div>
              <p className={styles.eyebrow}>JSON Image</p>
              <h1>图片提取器</h1>
            </div>
            <Link className={styles.backLink} href="/">
              返回首页
            </Link>
          </div>

          <p className={styles.panelCopy}>
            左侧输入任意 JSON，系统会递归遍历所有层级中的键和值，只要内容是 <code>http://</code> 或 <code>https://</code> 开头，就按图片处理。
          </p>

          <div className={styles.toolbar}>
            <button className={styles.ghostButton} type="button" onClick={fillExample}>
              填充示例
            </button>
            <button className={styles.primaryButton} type="button" onClick={() => parseJson(text)}>
              提取图片
            </button>
          </div>

          <label className={styles.editorLabel} htmlFor="jsonInput">
            JSON 内容
          </label>
          <textarea
            id="jsonInput"
            className={styles.jsonInput}
            spellCheck={false}
            placeholder={'例如：{"cover":"https://example.com/image.jpg"}'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className={statusClass} aria-live="polite">
            {status.message}
          </div>
        </section>

        <section className={styles.galleryPanel} aria-label="图片预览区">
          <div className={styles.galleryHead}>
            <div>
              <p className={styles.eyebrow}>Preview</p>
              <h2>图片列表</h2>
            </div>
            <div className={styles.summary}>
              <span>共找到</span>
              <strong>{images.length}</strong>
              <span>张图片</span>
            </div>
          </div>

          <div className={galleryClass}>
            {images.length === 0 ? (
              <div className={styles.emptyState}>
                <div>
                  <strong>暂无图片</strong>
                  <p>{parsed ? "当前 JSON 中没有找到以 http 或 https 开头的字符串。" : "左侧还没有输入 JSON 内容。"}</p>
                </div>
              </div>
            ) : (
              images.map((item, idx) => <ImageCard key={`${item.url}-${idx}`} item={item} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
