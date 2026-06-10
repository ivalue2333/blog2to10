"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

type Unit = "s" | "ms";

const pad = (n: number) => String(n).padStart(2, "0");

function formatLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function parseDateTime(value: string): Date | null {
  if (!value.trim()) return null;
  const normalized = value.trim().replace(/\//g, "-").replace("T", " ");
  const m = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (!m) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, mo, d, h = "0", mi = "0", s = "0"] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function TimestampPage() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [unit, setUnit] = useState<Unit>("s");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [tsError, setTsError] = useState("");
  const [dateError, setDateError] = useState("");
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const currentTs = useMemo(() => {
    return unit === "s" ? Math.floor(now.getTime() / 1000) : now.getTime();
  }, [now, unit]);

  const tsToDate = useMemo(() => {
    if (!tsInput.trim()) return null;
    const num = Number(tsInput.trim());
    if (!Number.isFinite(num)) return null;
    const ms = unit === "s" ? num * 1000 : num;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [tsInput, unit]);

  const dateToTs = useMemo(() => {
    const d = parseDateTime(dateInput);
    if (!d) return null;
    return unit === "s" ? Math.floor(d.getTime() / 1000) : d.getTime();
  }, [dateInput, unit]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* noop */
    }
  };

  const fillNow = () => {
    setTsInput(String(currentTs));
    setTsError("");
  };

  const fillDateNow = () => {
    setDateInput(formatLocal(new Date()));
    setDateError("");
  };

  const handleTsBlur = () => {
    if (!tsInput.trim()) {
      setTsError("");
      return;
    }
    const num = Number(tsInput.trim());
    if (!Number.isFinite(num)) {
      setTsError("请输入合法数字");
      return;
    }
    setTsError("");
  };

  const handleDateBlur = () => {
    if (!dateInput.trim()) {
      setDateError("");
      return;
    }
    if (!parseDateTime(dateInput)) {
      setDateError("格式不合法，例如：2025-01-01 12:00:00");
      return;
    }
    setDateError("");
  };

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="时间戳转换" />

      <main className={styles.shell}>
        <section className={styles.nowCard}>
          <div className={styles.nowHead}>
            <span className={styles.nowLabel}>当前时间戳</span>
            <div className={styles.unitSwitch} role="tablist">
              <button
                className={`${styles.unitBtn} ${unit === "s" ? styles.unitActive : ""}`}
                onClick={() => setUnit("s")}
                type="button"
              >
                秒
              </button>
              <button
                className={`${styles.unitBtn} ${unit === "ms" ? styles.unitActive : ""}`}
                onClick={() => setUnit("ms")}
                type="button"
              >
                毫秒
              </button>
            </div>
          </div>
          <div className={styles.nowValue}>
            <span className={styles.nowNumber}>{currentTs}</span>
            <button className={styles.copyBtn} type="button" onClick={() => copy(String(currentTs))}>
              复制
            </button>
            <button
              className={styles.ghostBtn}
              type="button"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? "停止" : "开始"}
            </button>
          </div>
          <div className={styles.nowMeta}>
            <span>本地：{formatLocal(now)}</span>
            <span>UTC：{formatUTC(now)}</span>
          </div>
        </section>

        <div className={styles.row}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>时间戳 → 日期</h2>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                onBlur={handleTsBlur}
                placeholder={unit === "s" ? "例如 1700000000" : "例如 1700000000000"}
              />
              <button className={styles.ghostBtn} type="button" onClick={fillNow}>
                填入当前
              </button>
            </div>
            {tsError ? <p className={styles.error}>{tsError}</p> : null}
            <div className={styles.resultList}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>本地时间</span>
                <span className={styles.resultValue}>
                  {tsToDate ? formatLocal(tsToDate) : "--"}
                </span>
                <button
                  className={styles.copyMini}
                  type="button"
                  disabled={!tsToDate}
                  onClick={() => tsToDate && copy(formatLocal(tsToDate))}
                >
                  复制
                </button>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>UTC 时间</span>
                <span className={styles.resultValue}>
                  {tsToDate ? formatUTC(tsToDate) : "--"}
                </span>
                <button
                  className={styles.copyMini}
                  type="button"
                  disabled={!tsToDate}
                  onClick={() => tsToDate && copy(formatUTC(tsToDate))}
                >
                  复制
                </button>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>ISO 8601</span>
                <span className={styles.resultValue}>
                  {tsToDate ? tsToDate.toISOString() : "--"}
                </span>
                <button
                  className={styles.copyMini}
                  type="button"
                  disabled={!tsToDate}
                  onClick={() => tsToDate && copy(tsToDate.toISOString())}
                >
                  复制
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>日期 → 时间戳</h2>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onBlur={handleDateBlur}
                placeholder="例如 2025-01-01 12:00:00"
              />
              <button className={styles.ghostBtn} type="button" onClick={fillDateNow}>
                填入当前
              </button>
            </div>
            {dateError ? <p className={styles.error}>{dateError}</p> : null}
            <div className={styles.resultList}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{unit === "s" ? "秒" : "毫秒"}</span>
                <span className={styles.resultValue}>
                  {dateToTs !== null ? dateToTs : "--"}
                </span>
                <button
                  className={styles.copyMini}
                  type="button"
                  disabled={dateToTs === null}
                  onClick={() => dateToTs !== null && copy(String(dateToTs))}
                >
                  复制
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className={styles.tipsCard}>
          <h2 className={styles.cardTitle}>说明</h2>
          <ul className={styles.tips}>
            <li>时间戳：从 1970-01-01 00:00:00 UTC 到目标时间的秒数（或毫秒数）。</li>
            <li>日期格式支持 <code>YYYY-MM-DD HH:mm:ss</code>、<code>YYYY/MM/DD</code>、<code>ISO 8601</code> 等。</li>
            <li>页面默认每秒更新当前时间戳，可点击「停止」暂停。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
