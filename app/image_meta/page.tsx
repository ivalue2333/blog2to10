"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

type ImageMeta = {
  width: number;
  height: number;
  size: number;
  readableSize: string;
  type: string;
  name: string;
  sourceLabel: string;
  md5: string;
};

type Status = { tone: "default" | "success" | "error"; message: React.ReactNode };

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

function isImageFile(file: File | null | undefined): boolean {
  return Boolean(file && typeof file.type === "string" && file.type.startsWith("image/"));
}

// MD5 implementation
function leftRotate(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}
function safeAdd(x: number, y: number) {
  return (((x >>> 0) + (y >>> 0)) & 0xffffffff) | 0;
}
function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  return safeAdd(leftRotate(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function md5Cycle(stateValue: number[], block: number[]) {
  let [a, b, c, d] = stateValue;
  a = ff(a, b, c, d, block[0], 7, -680876936);
  d = ff(d, a, b, c, block[1], 12, -389564586);
  c = ff(c, d, a, b, block[2], 17, 606105819);
  b = ff(b, c, d, a, block[3], 22, -1044525330);
  a = ff(a, b, c, d, block[4], 7, -176418897);
  d = ff(d, a, b, c, block[5], 12, 1200080426);
  c = ff(c, d, a, b, block[6], 17, -1473231341);
  b = ff(b, c, d, a, block[7], 22, -45705983);
  a = ff(a, b, c, d, block[8], 7, 1770035416);
  d = ff(d, a, b, c, block[9], 12, -1958414417);
  c = ff(c, d, a, b, block[10], 17, -42063);
  b = ff(b, c, d, a, block[11], 22, -1990404162);
  a = ff(a, b, c, d, block[12], 7, 1804603682);
  d = ff(d, a, b, c, block[13], 12, -40341101);
  c = ff(c, d, a, b, block[14], 17, -1502002290);
  b = ff(b, c, d, a, block[15], 22, 1236535329);

  a = gg(a, b, c, d, block[1], 5, -165796510);
  d = gg(d, a, b, c, block[6], 9, -1069501632);
  c = gg(c, d, a, b, block[11], 14, 643717713);
  b = gg(b, c, d, a, block[0], 20, -373897302);
  a = gg(a, b, c, d, block[5], 5, -701558691);
  d = gg(d, a, b, c, block[10], 9, 38016083);
  c = gg(c, d, a, b, block[15], 14, -660478335);
  b = gg(b, c, d, a, block[4], 20, -405537848);
  a = gg(a, b, c, d, block[9], 5, 568446438);
  d = gg(d, a, b, c, block[14], 9, -1019803690);
  c = gg(c, d, a, b, block[3], 14, -187363961);
  b = gg(b, c, d, a, block[8], 20, 1163531501);
  a = gg(a, b, c, d, block[13], 5, -1444681467);
  d = gg(d, a, b, c, block[2], 9, -51403784);
  c = gg(c, d, a, b, block[7], 14, 1735328473);
  b = gg(b, c, d, a, block[12], 20, -1926607734);

  a = hh(a, b, c, d, block[5], 4, -378558);
  d = hh(d, a, b, c, block[8], 11, -2022574463);
  c = hh(c, d, a, b, block[11], 16, 1839030562);
  b = hh(b, c, d, a, block[14], 23, -35309556);
  a = hh(a, b, c, d, block[1], 4, -1530992060);
  d = hh(d, a, b, c, block[4], 11, 1272893353);
  c = hh(c, d, a, b, block[7], 16, -155497632);
  b = hh(b, c, d, a, block[10], 23, -1094730640);
  a = hh(a, b, c, d, block[13], 4, 681279174);
  d = hh(d, a, b, c, block[0], 11, -358537222);
  c = hh(c, d, a, b, block[3], 16, -722521979);
  b = hh(b, c, d, a, block[6], 23, 76029189);
  a = hh(a, b, c, d, block[9], 4, -640364487);
  d = hh(d, a, b, c, block[12], 11, -421815835);
  c = hh(c, d, a, b, block[15], 16, 530742520);
  b = hh(b, c, d, a, block[2], 23, -995338651);

  a = ii(a, b, c, d, block[0], 6, -198630844);
  d = ii(d, a, b, c, block[7], 10, 1126891415);
  c = ii(c, d, a, b, block[14], 15, -1416354905);
  b = ii(b, c, d, a, block[5], 21, -57434055);
  a = ii(a, b, c, d, block[12], 6, 1700485571);
  d = ii(d, a, b, c, block[3], 10, -1894986606);
  c = ii(c, d, a, b, block[10], 15, -1051523);
  b = ii(b, c, d, a, block[1], 21, -2054922799);
  a = ii(a, b, c, d, block[8], 6, 1873313359);
  d = ii(d, a, b, c, block[15], 10, -30611744);
  c = ii(c, d, a, b, block[6], 15, -1560198380);
  b = ii(b, c, d, a, block[13], 21, 1309151649);
  a = ii(a, b, c, d, block[4], 6, -145523070);
  d = ii(d, a, b, c, block[11], 10, -1120210379);
  c = ii(c, d, a, b, block[2], 15, 718787259);
  b = ii(b, c, d, a, block[9], 21, -343485551);

  stateValue[0] = safeAdd(stateValue[0], a);
  stateValue[1] = safeAdd(stateValue[1], b);
  stateValue[2] = safeAdd(stateValue[2], c);
  stateValue[3] = safeAdd(stateValue[3], d);
}

function createMd5Block(bytes: Uint8Array, start: number) {
  const block = new Array(16).fill(0) as number[];
  for (let index = 0; index < 64; index += 1) {
    const value = bytes[start + index] || 0;
    block[index >> 2] |= value << ((index % 4) * 8);
  }
  return block;
}

function toHex32(value: number) {
  const normalized = value >>> 0;
  const hex = normalized.toString(16).padStart(8, "0");
  return hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);
}

function md5ArrayBuffer(buffer: ArrayBuffer): string {
  const input = new Uint8Array(buffer);
  const paddedLength = (((input.length + 8) >> 6) + 1) * 64;
  const bytes = new Uint8Array(paddedLength);
  const view = new DataView(bytes.buffer);
  const stateValue = [1732584193, -271733879, -1732584194, 271733878];

  bytes.set(input);
  bytes[input.length] = 0x80;
  view.setUint32(paddedLength - 8, input.length * 8, true);
  view.setUint32(paddedLength - 4, Math.floor((input.length * 8) / 0x100000000), true);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    md5Cycle(stateValue, createMd5Block(bytes, offset));
  }
  return stateValue.map(toHex32).join("");
}

async function getFileMd5(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return md5ArrayBuffer(buffer);
}

function readImageMeta(file: File, source: "clipboard" | "local"): Promise<{ meta: Omit<ImageMeta, "md5">; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({
        meta: {
          height: image.naturalHeight,
          width: image.naturalWidth,
          name: file.name || "剪切板图片",
          readableSize: formatBytes(file.size),
          size: file.size,
          sourceLabel: source === "clipboard" ? "剪切板" : "本地文件",
          type: file.type || "未知类型",
        },
        previewUrl: objectUrl,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("图片读取失败，请换一张图片再试。"));
    };
    image.src = objectUrl;
  });
}

const initialStatus: Status = {
  tone: "default",
  message: (
    <>
      按 <kbd>Command</kbd> + <kbd>V</kbd> 或 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴图片。
    </>
  ),
};

export default function ImageImportInspectorPage() {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [previewUrl, setPreviewUrl] = useState("");
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const previewUrlRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pasteZoneRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const setError = useCallback((message: string) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setPreviewUrl("");
    setMeta(null);
    setStatus({ tone: "error", message });
  }, []);

  const loadFile = useCallback(
    async (file: File, source: "clipboard" | "local") => {
      if (!isImageFile(file)) {
        setError("当前内容不是图片文件，请重新选择或重新复制。");
        return;
      }
      setStatus({ tone: "default", message: "正在解析图片并计算 MD5，请稍候..." });
      try {
        const result = await readImageMeta(file, source);
        const md5 = await getFileMd5(file);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = result.previewUrl;
        setPreviewUrl(result.previewUrl);
        const fullMeta: ImageMeta = { ...result.meta, md5 };
        setMeta(fullMeta);
        setStatus({
          tone: "success",
          message: `导入成功，已读取 ${fullMeta.width} × ${fullMeta.height} 的图片。`,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setError(msg);
      }
    },
    [setError]
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      const file = imageItem ? imageItem.getAsFile() : null;
      if (!file) {
        setError("本次粘贴里没有检测到图片，请确认你复制的是图片或截图。");
        return;
      }
      event.preventDefault();
      loadFile(file, "clipboard");
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile, setError]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    loadFile(file, "local");
    event.target.value = "";
  };

  const sourceBadge = meta ? meta.sourceLabel : "未导入";

  const statusClass = `${styles.statusCard} ${
    status.tone === "success" ? styles.success : status.tone === "error" ? styles.error : ""
  }`;

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="图片信息查看" />
      <main className={styles.shell}>
        <section className={styles.introPanel} aria-label="图片导入操作区">
          <div className={styles.introHead}>
            <div>
              <p className={styles.eyebrow}>Image Intake Desk</p>
              <h1>图片信息查看</h1>
            </div>
          </div>

          <div className={statusClass} aria-live="polite">
            {status.message}
          </div>

          <div className={styles.importStack}>
            <button
              ref={pasteZoneRef}
              className={styles.pasteZone}
              type="button"
              onClick={() => pasteZoneRef.current?.focus()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pasteZoneRef.current?.focus();
                }
              }}
            >
              <span className={styles.zoneLabel}>剪切板导入</span>
              <strong>点击聚焦后粘贴图片</strong>
            </button>

            <label className={styles.fileTrigger} htmlFor="fileInput">
              <span className={styles.zoneLabel}>本地文件</span>
              <strong>从电脑中选择图片</strong>
            </label>
            <input
              id="fileInput"
              ref={fileInputRef}
              className={styles.srOnly}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </section>

        <section className={styles.previewPanel} aria-label="图片信息区">
          {previewUrl && (
            <div className={styles.previewFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.previewImage} src={previewUrl} alt="当前导入的图片预览" />
            </div>
          )}

          <div className={styles.metaPanel}>
            <div className={styles.metaHead}>
              <div>
                <p className={styles.eyebrow}>Metadata</p>
                <h2>图片信息</h2>
              </div>
              <span className={styles.sourceBadge}>{sourceBadge}</span>
            </div>

            <div className={styles.metaGrid} aria-label="图片基础信息">
              <article className={styles.metaCard}>
                <span>宽度</span>
                <strong>{meta ? `${meta.width}px` : "--"}</strong>
              </article>
              <article className={styles.metaCard}>
                <span>高度</span>
                <strong>{meta ? `${meta.height}px` : "--"}</strong>
              </article>
              <article className={styles.metaCard}>
                <span>大小</span>
                <strong>{meta ? meta.readableSize : "--"}</strong>
              </article>
              <article className={`${styles.metaCard} ${styles.metaCardWide}`}>
                <span>MD5</span>
                <strong className={styles.metaMd5}>{meta ? meta.md5 : "--"}</strong>
              </article>
              <article className={styles.metaCard}>
                <span>类型</span>
                <strong>{meta ? meta.type : "--"}</strong>
              </article>
              <article className={styles.metaCard}>
                <span>文件名</span>
                <strong className={styles.metaName}>{meta ? meta.name : "--"}</strong>
              </article>
              <article className={styles.metaCard}>
                <span>来源</span>
                <strong>{meta ? meta.sourceLabel : "--"}</strong>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
