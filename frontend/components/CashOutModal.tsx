import React from "react";
import { Modal } from "./Modal";
import styles from "./CashOutModal.module.css";

/** Multiplier table matching contract spec (bps). */
const MULTIPLIERS: Record<number, number> = {
  1: 19000,
  2: 35000,
  3: 60000,
};
const MULTIPLIER_CAP = 100000; // streak 4+

function getMultiplierBps(streak: number): number {
  return MULTIPLIERS[streak] ?? MULTIPLIER_CAP;
}

function formatXlm(stroops: number): string {
  return (stroops / 10_000_000).toFixed(4);
}

function calcPayout(wager: number, multiplierBps: number, feeBps: number): number {
  const gross = Math.floor((wager * multiplierBps) / 10_000);
  const fee = Math.floor((gross * feeBps) / 10_000);
  return gross - fee;
}

export interface CashOutModalProps {
  open: boolean;
  onClose: () => void;
  /** Current streak count (1-based: 1 = first win). */
  streak: number;
  wager: number;
  feeBps: number;
  onCashOut: () => void;
  onContinue: () => void;
}

export function CashOutModal({
  open,
  onClose,
  streak,
  wager,
  feeBps,
  onCashOut,
  onContinue,
}: CashOutModalProps) {
  const currentMultiplierBps = getMultiplierBps(streak);
  const nextMultiplierBps = getMultiplierBps(streak + 1);

  const currentPayout = calcPayout(wager, currentMultiplierBps, feeBps);
  const nextPayout = calcPayout(wager, nextMultiplierBps, feeBps);

  const currentMultiplierLabel = (currentMultiplierBps / 10_000).toFixed(1);
  const nextMultiplierLabel = (nextMultiplierBps / 10_000).toFixed(1);

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="cashout-title"
      descriptionId="cashout-desc"
    >
      <div className={styles.root}>
        <header className={styles.header}>
          <h2 id="cashout-title" className={styles.title}>
            Cash Out or Continue?
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <p id="cashout-desc" className={styles.streakBadge}>
          {streak}-Win Streak
        </p>

        {/* Comparison cards */}
        <div className={styles.comparison}>
          {/* Cash out */}
          <div className={styles.option}>
            <span className={styles.optionLabel}>Cash Out Now</span>
            <span className={styles.multiplier}>{currentMultiplierLabel}×</span>
            <span className={styles.payout}>{formatXlm(currentPayout)} XLM</span>
            <span className={styles.optionNote}>Secured profit</span>
          </div>

          <div className={styles.divider} aria-hidden="true">vs</div>

          {/* Continue */}
          <div className={[styles.option, styles.optionRisk].join(" ")}>
            <span className={styles.optionLabel}>Continue Streak</span>
            <span className={styles.multiplier}>{nextMultiplierLabel}×</span>
            <span className={styles.payout}>{formatXlm(nextPayout)} XLM</span>
            <span className={[styles.optionNote, styles.riskNote].join(" ")}>
              ⚠ Lose all if next flip fails
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCashOut} onClick={onCashOut}>
            Cash Out {formatXlm(currentPayout)} XLM
          </button>
          <button className={styles.btnContinue} onClick={onContinue}>
            Risk It — Go for {nextMultiplierLabel}×
          </button>
        </div>
      </div>
    </Modal>
  );
}
