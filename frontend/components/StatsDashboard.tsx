import React, { useCallback, useEffect, useRef, useState } from "react";
import { ContractStats, formatGames, stroopsToXlm } from "./statsUtils";
import { LoadingSpinner } from "./LoadingSpinner";
import styles from "./StatsDashboard.module.css";

// ── Stat card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  description?: string;
}

function StatCard({ label, value, unit, description }: StatCardProps) {
  return (
    <div className={styles.card}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </dd>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export interface StatsDashboardProps {
  /**
   * Async function that fetches current stats from the contract.
   * Swap this out for your actual Soroban RPC call.
   */
  fetchStats: () => Promise<ContractStats>;
  /** Poll interval in ms. Default 15 000. Pass 0 to disable polling. */
  pollInterval?: number;
}

type Status = "idle" | "loading" | "success" | "error";

export function StatsDashboard({ fetchStats, pollInterval = 15_000 }: StatsDashboardProps) {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setStatus((s) => (s === "idle" ? "loading" : s));
    try {
      const data = await fetchStats();
      setStats(data);
      setLastUpdated(new Date());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [fetchStats]);

  useEffect(() => {
    load();
    if (pollInterval > 0) {
      intervalRef.current = setInterval(load, pollInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load, pollInterval]);

  const cards = stats
    ? [
        {
          label: "Total Games",
          value: formatGames(stats.total_games),
          description: "Cumulative games started on-chain",
        },
        {
          label: "Total Volume",
          value: stroopsToXlm(stats.total_volume),
          unit: "XLM",
          description: "Cumulative XLM wagered",
        },
        {
          label: "Fees Collected",
          value: stroopsToXlm(stats.total_fees),
          unit: "XLM",
          description: "Protocol rake accumulated",
        },
        {
          label: "Reserve Balance",
          value: stroopsToXlm(stats.reserve_balance),
          unit: "XLM",
          description: "Current contract solvency reserve",
        },
      ]
    : [];

  return (
    <section className={styles.section} aria-labelledby="stats-heading" aria-live="polite">
      <div className={styles.header}>
        <h2 id="stats-heading" className={styles.heading}>
          Contract Stats
        </h2>
        <div className={styles.meta}>
          {status === "loading" && stats === null && (
            <LoadingSpinner size="small" label="Loading stats…" />
          )}
          {status === "error" && (
            <span className={styles.errorBadge} role="alert">
              Failed to load
            </span>
          )}
          {lastUpdated && (
            <span className={styles.timestamp}>
              Updated{" "}
              <time dateTime={lastUpdated.toISOString()}>
                {lastUpdated.toLocaleTimeString()}
              </time>
            </span>
          )}
          {pollInterval > 0 && (
            <button className={styles.refreshBtn} onClick={load} aria-label="Refresh stats">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M12.5 2.5A6 6 0 1 1 7 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M7 1l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {status === "loading" && stats === null ? (
        <div className={styles.loadingGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton} aria-hidden="true" />
          ))}
        </div>
      ) : (
        <dl className={styles.grid}>
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </dl>
      )}
    </section>
  );
}
