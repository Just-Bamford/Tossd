import React, { useCallback, useRef, useState } from "react";
import styles from "./TransactionHistory.module.css";

export type GameOutcome = "win" | "loss" | "pending";
export type CoinSide = "heads" | "tails";

export interface GameRecord {
  id: string;
  timestamp: number; // Unix ms
  side: CoinSide;
  wagerStroops: number;
  payoutStroops: number | null; // null when pending or loss
  outcome: GameOutcome;
  streak: number;
  txHash?: string;
}

interface TransactionRowProps {
  record: GameRecord;
}

function formatXLM(stroops: number): string {
  return (stroops / 10_000_000).toFixed(7).replace(/\.?0+$/, "") + " XLM";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OutcomeChip({ outcome }: { outcome: GameOutcome }) {
  const label = outcome === "win" ? "Win" : outcome === "loss" ? "Loss" : "Pending";
  return (
    <span className={`${styles.chip} ${styles[`chip--${outcome}`]}`}>
      {label}
    </span>
  );
}

function TransactionRow({ record }: TransactionRowProps) {
  return (
    <li className={styles.row}>
      <div className={styles.rowLeft}>
        <OutcomeChip outcome={record.outcome} />
        <span className={styles.meta}>
          <span className={styles.side}>{record.side}</span>
          {record.streak > 0 && (
            <span className={styles.streak}>×{record.streak + 1} streak</span>
          )}
        </span>
      </div>
      <div className={styles.rowRight}>
        <span className={styles.mono}>{formatXLM(record.wagerStroops)}</span>
        {record.payoutStroops != null && (
          <span className={`${styles.mono} ${styles.payout}`}>
            +{formatXLM(record.payoutStroops)}
          </span>
        )}
        <time className={styles.time} dateTime={new Date(record.timestamp).toISOString()}>
          {formatDate(record.timestamp)}
        </time>
      </div>
    </li>
  );
}

const PAGE_SIZE = 20;

export interface TransactionHistoryProps {
  records: GameRecord[];
  /** Use "paginate" for explicit prev/next, "infinite" for scroll-based loading. */
  mode?: "paginate" | "infinite";
}

export function TransactionHistory({
  records,
  mode = "infinite",
}: TransactionHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [page, setPage] = useState(0);

  // Reverse-chronological order
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
  }, [sorted.length]);

  // Infinite scroll via IntersectionObserver
  React.useEffect(() => {
    if (mode !== "infinite") return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, loadMore]);

  if (records.length === 0) {
    return (
      <section className={styles.container} aria-label="Transaction history">
        <p className={styles.empty}>No games played yet.</p>
      </section>
    );
  }

  const paginatedRecords =
    mode === "paginate"
      ? sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
      : sorted.slice(0, visibleCount);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const hasMore = mode === "infinite" && visibleCount < sorted.length;

  return (
    <section className={styles.container} aria-label="Transaction history">
      <h2 className={styles.heading}>Game History</h2>
      <ul className={styles.list} role="list">
        {paginatedRecords.map((r) => (
          <TransactionRow key={r.id} record={r} />
        ))}
      </ul>

      {mode === "infinite" && hasMore && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      )}

      {mode === "paginate" && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="History pages">
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>
            {page + 1} / {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </section>
  );
}
