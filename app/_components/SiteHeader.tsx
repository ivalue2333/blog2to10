import Link from "next/link";
import styles from "./SiteHeader.module.css";

type Props = {
  currentTool?: string;
};

export default function SiteHeader({ currentTool }: Props) {
  return (
    <header className={styles.siteHeader}>
      <nav className={styles.topbar} aria-label="主导航">
        <div className={styles.left}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandIcon} aria-hidden="true">
              <svg viewBox="0 0 32 32" role="img">
                <path d="M6 12h20l-1.5 14a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6 12Z" fill="#2bb673" />
                <path d="M12 9a4 4 0 0 1 8 0v3h-2V9a2 2 0 0 0-4 0v3h-2V9Z" fill="#2bb673" />
                <rect x="4" y="11" width="24" height="3" rx="1" fill="#1f9d63" />
              </svg>
            </span>
            <span className={styles.brandText}>在线工具</span>
          </Link>
          {currentTool ? (
            <span className={styles.currentTool}>{currentTool}</span>
          ) : null}
        </div>

        {currentTool ? null : (
          <div className={styles.search} role="search">
            <input
              className={styles.searchInput}
              type="search"
              placeholder="搜索很简单"
              aria-label="搜索"
            />
            <button className={styles.searchBtn} type="button">搜索</button>
          </div>
        )}
      </nav>
    </header>
  );
}
