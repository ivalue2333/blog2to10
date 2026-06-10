"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import SiteHeader from "../_components/SiteHeader";
import styles from "./page.module.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <div className={styles.loading}>白板加载中...</div> }
);

const STORAGE_KEY = "excalidraw_main_board_content";

type StoredScene = {
  elements: readonly unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

export default function WhiteboardPage() {
  const [initialData, setInitialData] = useState<StoredScene | null>(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("localforage");
        const localforage = mod.default ?? mod;
        localforage.config({
          name: "Whiteboard",
          storeName: "excalidraw_store",
          driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
        });
        const stored = (await localforage.getItem(STORAGE_KEY)) as StoredScene | null;
        if (cancelled) return;
        if (stored && Array.isArray(stored.elements)) {
          setInitialData({
            elements: stored.elements,
            appState: { ...(stored.appState || {}), collaborators: new Map() } as Record<string, unknown>,
            files: stored.files || {},
          });
        } else {
          setInitialData({ elements: [], appState: { collaborators: new Map() }, files: {} });
        }
      } catch {
        setInitialData({ elements: [], appState: { collaborators: new Map() }, files: {} });
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    elements: readonly unknown[],
    appState: Record<string, unknown>,
    files: Record<string, unknown>
  ) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const mod = await import("localforage");
        const localforage = mod.default ?? mod;
        const cleanAppState: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(appState)) {
          if (k === "collaborators") continue;
          cleanAppState[k] = v;
        }
        await localforage.setItem(STORAGE_KEY, {
          elements,
          appState: cleanAppState,
          files,
        });
      } catch {
        /* noop */
      }
    }, 500);
  };

  return (
    <div className={styles.page}>
      <SiteHeader currentTool="白板工具" />
      <div className={styles.frameWrap}>
        {ready && initialData ? (
          <Excalidraw
            initialData={initialData as never}
            onChange={handleChange as never}
          />
        ) : (
          <div className={styles.loading}>白板加载中...</div>
        )}
      </div>
    </div>
  );
}
