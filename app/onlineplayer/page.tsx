"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type PlaylistItem = {
  name: string;
  url: string;
  file: File;
  isTranscoded: boolean;
};

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: new () => FFmpegInstance };
    FFmpegUtil?: {
      toBlobURL: (url: string, mime: string) => Promise<string>;
      fetchFile: (file: File) => Promise<Uint8Array>;
    };
  }
}

type FFmpegInstance = {
  on: (event: string, handler: (payload: { progress?: number; time?: number; message?: string }) => void) => void;
  load: (config: { coreURL: string; wasmURL: string }) => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<void>;
  readFile: (name: string) => Promise<{ buffer: ArrayBuffer }>;
  deleteFile: (name: string) => Promise<void>;
};

const PlayIcon = () => (
  <svg viewBox="0 0 384 512" width="1em" height="1em" fill="currentColor">
    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"></path>
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 320 512" width="1em" height="1em" fill="currentColor">
    <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"></path>
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 384 512" width="1em" height="1em" fill="currentColor">
    <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"></path>
  </svg>
);

const PrevIcon = () => (
  <svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor">
    <path d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"></path>
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor">
    <path d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"></path>
  </svg>
);

const SkipBackIcon = () => (
  <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z"></path>
  </svg>
);

const SkipForwardIcon = () => (
  <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z"></path>
  </svg>
);

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 576 512" width="1em" height="1em" fill="currentColor">
    <path d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95-7.34 11.17-4.22 26.18 6.95 33.51 66.27 43.49 105.82 116.6 105.82 195.58 0 78.98-39.55 152.09-105.82 195.58-11.17 7.32-14.29 22.34-6.95 33.5 7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"></path>
    {muted ? <path d="M416 208L272 352" stroke="currentColor" strokeWidth="32" strokeLinecap="round" /> : null}
  </svg>
);

const FullscreenIcon = () => (
  <svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor">
    <path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"></path>
  </svg>
);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

export default function OnlinePlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const playlistRef = useRef<PlaylistItem[]>([]);
  const currentIndexRef = useRef<number>(-1);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hideUpload, setHideUpload] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeStatus, setTranscodeStatus] = useState("初始化中...");
  const [transcodeProgress, setTranscodeProgress] = useState(0);
  const [transcodeError, setTranscodeError] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (!window.FFmpegWASM || !window.FFmpegUtil) {
      alert("FFmpeg 组件尚未加载完成，请稍候重试。");
      return null;
    }
    try {
      const { FFmpeg } = window.FFmpegWASM;
      const { toBlobURL } = window.FFmpegUtil;
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        if (typeof progress === "number") {
          setTranscodeProgress(Math.min(progress * 100, 100));
          setTranscodeStatus(`转换中... ${Math.round(progress * 100)}%`);
        }
      });
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } catch (e) {
      console.error("Failed to load FFmpeg:", e);
      alert("无法加载转码组件，可能无法播放部分格式视频。\n请确保网络连接正常。");
      return null;
    }
  }, []);

  const renderActiveItem = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const loadVideo = useCallback((index: number) => {
    const list = playlistRef.current;
    if (index < 0 || index >= list.length) return;
    const video = videoRef.current;
    if (!video) return;
    setIsTranscoding(false);
    setTranscodeError(false);
    renderActiveItem(index);
    video.src = list[index].url;
    video.load();
  }, [renderActiveItem]);

  const transcodeAndPlay = useCallback(async (item: PlaylistItem, itemIndex: number) => {
    if (item.isTranscoded) return;
    setIsTranscoding(true);
    setTranscodeError(false);
    setTranscodeStatus("加载核心组件...");
    setTranscodeProgress(0);
    const ffmpeg = await loadFFmpeg();
    if (!ffmpeg) {
      setTranscodeStatus("组件加载失败");
      setTranscodeError(true);
      setTimeout(() => setIsTranscoding(false), 2000);
      return;
    }
    setTranscodeStatus("读取文件...");
    try {
      if (!window.FFmpegUtil) throw new Error("FFmpeg 工具未就绪");
      const { fetchFile } = window.FFmpegUtil;
      const inputFile = "input";
      const outputFile = "output.mp4";
      await ffmpeg.writeFile(inputFile, await fetchFile(item.file));
      setTranscodeStatus("正在转换 (这可能需要几分钟)...");
      await ffmpeg.exec([
        "-i",
        inputFile,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "28",
        "-c:a",
        "aac",
        "-strict",
        "experimental",
        outputFile,
      ]);
      setTranscodeStatus("生成播放地址...");
      const data = await ffmpeg.readFile(outputFile);
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const newUrl = URL.createObjectURL(blob);
      await ffmpeg.deleteFile(inputFile);
      await ffmpeg.deleteFile(outputFile);

      setPlaylist((prev) => {
        const next = [...prev];
        if (next[itemIndex]) {
          next[itemIndex] = { ...next[itemIndex], url: newUrl, isTranscoded: true };
        }
        return next;
      });
      setIsTranscoding(false);
      const video = videoRef.current;
      if (video) {
        video.src = newUrl;
        video.load();
        video.play().catch(() => undefined);
      }
    } catch (e) {
      console.error(e);
      setTranscodeStatus("转换失败: " + (e as Error).message);
      setTranscodeError(true);
    }
  }, [loadFFmpeg]);

  const handleFiles = useCallback(
    (files: File[]) => {
      const newItems: PlaylistItem[] = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file,
        isTranscoded: false,
      }));
      const wasEmpty = playlistRef.current.length === 0;
      const merged = [...playlistRef.current, ...newItems];
      setPlaylist(merged);
      playlistRef.current = merged;
      if (wasEmpty) {
        loadVideo(0);
      }
    },
    [loadVideo]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setHideUpload(false);
  };

  const playPrev = () => {
    if (playlistRef.current.length === 0) return;
    let next = currentIndexRef.current - 1;
    if (next < 0) next = playlistRef.current.length - 1;
    loadVideo(next);
  };

  const playNext = () => {
    if (playlistRef.current.length === 0) return;
    let next = currentIndexRef.current + 1;
    if (next >= playlistRef.current.length) next = 0;
    loadVideo(next);
  };

  const removeFromPlaylist = (index: number) => {
    const list = [...playlistRef.current];
    URL.revokeObjectURL(list[index].url);
    list.splice(index, 1);
    setPlaylist(list);
    playlistRef.current = list;
    if (list.length === 0) {
      clearPlaylistInternal();
      return;
    }
    if (index === currentIndexRef.current) {
      let target = currentIndexRef.current;
      if (target >= list.length) target = 0;
      loadVideo(target);
    } else if (index < currentIndexRef.current) {
      setCurrentIndex(currentIndexRef.current - 1);
    }
  };

  const clearPlaylistInternal = () => {
    playlistRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setPlaylist([]);
    playlistRef.current = [];
    setCurrentIndex(-1);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    setHideUpload(false);
    setIsPlaying(false);
    setControlsEnabled(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const clearPlaylist = () => {
    if (confirm("确定要清空播放列表吗？")) {
      clearPlaylistInternal();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(e.target.value);
    if (videoRef.current) videoRef.current.playbackRate = parseFloat(e.target.value);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = v;
    }
    setCurrentTime(v);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const toggleFullscreen = () => {
    const section = videoSectionRef.current;
    if (!section) return;
    if (!document.fullscreenElement) {
      section.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const cancelTranscode = () => {
    setIsTranscoding(false);
    setTranscodeError(false);
  };

  // attach video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      setDuration(video.duration);
      setControlsEnabled(true);
      setHideUpload(true);
      video.play().catch(() => undefined);
    };
    const onTime = () => setCurrentTime(video.currentTime);
    const onPlay = () => {
      setIsPlaying(true);
      setHideUpload(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => playNext();
    const onError = async () => {
      if (!video.src) return;
      const idx = currentIndexRef.current;
      if (idx >= 0 && playlistRef.current[idx]) {
        await transcodeAndPlay(playlistRef.current[idx], idx);
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [transcodeAndPlay]);

  useEffect(() => {
    return () => {
      playlistRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFiles(files);
  };

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const ctrlBtnClass = `${styles.ctrlBtn}`;
  const playPauseClass = `${styles.ctrlBtn} ${styles.ctrlBtnLarge}`;
  const playlistEmpty = playlist.length === 0;

  return (
    <>
      <Script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js" strategy="afterInteractive" />
      <div className={styles.body}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <Link className={styles.logo} href="/">
                <span>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="16" fill="#3B82F6" />
                    <path d="M12 10L22 16L12 22V10Z" fill="white" />
                  </svg>
                </span>
                <span>OnlinePlayer</span>
              </Link>
            </div>
            <div className={styles.headerRight}>
              <nav className={styles.headerNavigation}>
                <Link className={`${styles.navLink} ${styles.navLinkActive}`} href="/">
                  主页
                </Link>
              </nav>
            </div>
          </header>

          <main className={styles.body_main}>
            <div className={styles.mainContentWrapper}>
              <div
                ref={videoSectionRef}
                className={`${styles.videoSection} ${!isPlaying ? styles.paused : ""}`}
              >
                <div
                  className={styles.videoContainer}
                  onDragEnter={preventDefault}
                  onDragOver={preventDefault}
                  onDragLeave={preventDefault}
                  onDrop={handleDrop}
                >
                  <video ref={videoRef} className={styles.videoPlayer} preload="auto" />
                  {!hideUpload && (
                    <div className={styles.uploadArea}>
                      <div className={styles.fileSelection}>
                        <div className={styles.uploadIcon}>
                          <svg viewBox="0 0 640 512" width="64" height="64" fill="currentColor">
                            <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
                          </svg>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className={styles.fileInput}
                          accept="*/*"
                          multiple
                          onChange={handleFileInputChange}
                        />
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.primaryBtn}`}
                          onClick={triggerFileSelect}
                        >
                          选择视频文件
                        </button>
                        <p className={styles.uploadHint}>支持所有格式：MP4, AVI, MKV, WMV, FLV, MOV 等</p>
                      </div>
                    </div>
                  )}
                  {isTranscoding && (
                    <div className={styles.transcodeOverlay}>
                      <div className={styles.transcodeContent}>
                        <div className={styles.spinner}></div>
                        <h3>正在转换视频格式...</h3>
                        <p>为了在浏览器中播放，我们需要转换此视频格式。</p>
                        <p
                          className={`${styles.transcodeStatus} ${transcodeError ? styles.transcodeStatusError : ""}`}
                        >
                          {transcodeStatus}
                        </p>
                        <div className={styles.transcodeProgressBg}>
                          <div
                            className={styles.transcodeProgressBar}
                            style={{ width: `${transcodeProgress}%` }}
                          ></div>
                        </div>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSmall}`}
                          onClick={cancelTranscode}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.controls}>
                  <div className={styles.progressContainer}>
                    <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
                    <div className={styles.progressBarWrapper}>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        className={styles.progressBarInput}
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeekChange}
                      />
                    </div>
                    <span className={styles.timeDisplay}>{formatTime(duration)}</span>
                  </div>

                  <div className={styles.controlGroup}>
                    <div className={styles.controlButtons}>
                      <button
                        type="button"
                        className={playPauseClass}
                        disabled={!controlsEnabled}
                        onClick={togglePlay}
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={!controlsEnabled}
                        onClick={stopVideo}
                      >
                        <StopIcon />
                      </button>
                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={playlistEmpty}
                        onClick={playPrev}
                      >
                        <PrevIcon />
                      </button>
                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={playlistEmpty}
                        onClick={playNext}
                      >
                        <NextIcon />
                      </button>
                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={!controlsEnabled}
                        onClick={skipBackward}
                      >
                        <SkipBackIcon />
                      </button>
                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={!controlsEnabled}
                        onClick={skipForward}
                      >
                        <SkipForwardIcon />
                      </button>

                      <div className={styles.volumeContainer}>
                        <button
                          type="button"
                          className={ctrlBtnClass}
                          disabled={!controlsEnabled}
                          onClick={toggleMute}
                        >
                          <VolumeIcon muted={muted || volume === 0} />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          className={styles.volumeSlider}
                          value={muted ? 0 : volume}
                          onChange={handleVolumeChange}
                          disabled={!controlsEnabled}
                        />
                        <span className={styles.volumeValue}>{Math.round((muted ? 0 : volume) * 100)}%</span>
                      </div>

                      <select
                        className={styles.speedSelect}
                        value={speed}
                        onChange={handleSpeedChange}
                        disabled={!controlsEnabled}
                      >
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2.0x</option>
                      </select>

                      <button
                        type="button"
                        className={ctrlBtnClass}
                        disabled={!controlsEnabled}
                        onClick={toggleFullscreen}
                      >
                        <FullscreenIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.playlistSection}>
                <div className={styles.playlistHeader}>
                  <h2 className={styles.playlistTitle}>
                    <svg
                      viewBox="0 0 512 512"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      style={{ marginRight: 8 }}
                    >
                      <path d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path>
                    </svg>
                    播放列表
                  </h2>
                  <div className={styles.playlistActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSmall}`}
                      onClick={triggerFileSelect}
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSmall}`}
                      disabled={playlistEmpty}
                      onClick={clearPlaylist}
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className={styles.playlistContainer}>
                  {playlistEmpty ? (
                    <div className={styles.emptyPlaylist}>
                      <svg
                        viewBox="0 0 16 16"
                        width="48"
                        height="48"
                        fill="currentColor"
                        style={{ opacity: 0.5, marginBottom: "1rem" }}
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4 4h3v1H4v3H3V5H0V4h3V1h1v3zM1 14.5V9h1v5h12V7H8V6h6V4H8V3h6.5l.5.5v11l-.5.5h-13l-.5-.5z"
                        ></path>
                      </svg>
                      <h3>播放列表为空</h3>
                      <p>添加视频文件到播放列表</p>
                    </div>
                  ) : (
                    <ul className={styles.playlistItems}>
                      {playlist.map((item, index) => (
                        <li
                          key={item.url}
                          className={`${styles.playlistItem} ${index === currentIndex ? styles.playlistItemActive : ""}`}
                          onClick={() => loadVideo(index)}
                        >
                          <div className={styles.playlistItemName} title={item.name}>
                            <span>
                              {index + 1}. {item.name}
                              {item.isTranscoded ? <span className={styles.transcodedTag}>[转码]</span> : null}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.playlistItemRemove}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromPlaylist(index);
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </main>

          <section className={styles.toolIntro}>
            <h1>OnlinePlayer：您的首选在线视频播放器</h1>
            <p>一款注重隐私的免费在线视频播放器，可在您的浏览器中运行。支持所有格式，无需安装。</p>
          </section>

          <footer className={styles.footer}>
            <div className={styles.footerLinks}>
              <Link href="/">首页</Link>
            </div>
            <p>© 2025 OnlinePlayer. 保留所有权利。</p>
          </footer>
        </div>
      </div>
    </>
  );
}
