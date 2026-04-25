import React from "react";
import styles from "./OutcomeChip.module.css";

export type OutcomeChipState = "win" | "loss" | "pending";

interface OutcomeChipProps {
  state: OutcomeChipState;
}

const CONFIG: Record<
  OutcomeChipState,
  { label: string; icon: React.ReactNode; className: string }
> = {
  win: {
    label: "Win",
    className: styles.win,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
      </svg>
    ),
  },
  loss: {
    label: "Loss",
    className: styles.loss,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
      </svg>
    ),
  },
  pending: {
    label: "Pending",
    className: styles.pending,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 4a.75.75 0 0 1 .75.75v3.5l2 1.15a.75.75 0 1 1-.75 1.3l-2.25-1.3A.75.75 0 0 1 7.25 8.75v-4A.75.75 0 0 1 8 4z" />
      </svg>
    ),
  },
};

export function OutcomeChip({ state }: OutcomeChipProps) {
  const { label, icon, className } = CONFIG[state];

  return (
    <span
      className={`${styles.chip} ${className}`}
      role="status"
      aria-label={`Outcome: ${label}`}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
