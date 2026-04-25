import React from "react";
import styles from "./GameStateCard.module.css";

export type GamePhase = "idle" | "committed" | "won" | "lost" | "timed_out";
export type CoinSide = "heads" | "tails";

export interface GameState {
  phase: GamePhase;
  side: CoinSide;
  wagerStroops: number;
  streak: number; // 0-based; 0 = first win pending
  /** Pending tx hash for in-flight operations */
  pendingTx?: string;
}

export interface GameStateCardProps {
  game: GameState | null;
  /** Called when player clicks Reveal */
  onReveal?: () => void;
  /** Called when player clicks Cash Out */
  onCashOut?: () => void;
  /** Called when player clicks Continue Streak */
  onContinue?: () => void;
  /** True while a blockchain tx is in-flight */
  loading?: boolean;
}

const MULTIPLIERS: Record<number, string> = {
  0: "1.9×",
  1: "3.5×",
  2: "6.0×",
};

function getMultiplier(streak: number): string {
  return MULTIPLIERS[streak] ?? "10.0×";
}

function formatXLM(stroops: number): string {
  return (stroops / 10_000_000).toFixed(7).replace(/\.?0+$/, "") + " XLM";
}

const PHASE_LABELS: Record<GamePhase, string> = {
  idle: "No Active Game",
  committed: "Awaiting Reveal",
  won: "You Won!",
  lost: "You Lost",
  timed_out: "Timed Out",
};

export function GameStateCard({
  game,
  onReveal,
  onCashOut,
  onContinue,
  loading = false,
}: GameStateCardProps) {
  if (!game || game.phase === "idle") {
    return (
      <div className={`${styles.card} ${styles.idle}`}>
        <p className={styles.idleText}>Start a game to see your game state here.</p>
      </div>
    );
  }

  const { phase, side, wagerStroops, streak, pendingTx } = game;
  const multiplier = getMultiplier(streak);

  const phaseClass =
    phase === "won"
      ? styles.phaseWon
      : phase === "lost" || phase === "timed_out"
      ? styles.phaseLost
      : styles.phaseNeutral;

  return (
    <div className={styles.card} aria-live="polite" aria-atomic="true">
      {/* Phase badge */}
      <div className={styles.header}>
        <span className={`${styles.phaseBadge} ${phaseClass}`}>
          {PHASE_LABELS[phase]}
        </span>
        <span className={`${styles.side}`}>{side}</span>
      </div>

      {/* Stats row */}
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Wager</dt>
          <dd className={styles.statValue}>{formatXLM(wagerStroops)}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Multiplier</dt>
          <dd className={`${styles.statValue} ${styles.accent}`}>{multiplier}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Streak</dt>
          <dd className={styles.statValue}>{streak}</dd>
        </div>
      </dl>

      {/* Pending tx */}
      {pendingTx && (
        <p className={styles.txHash}>
          <span className={styles.txLabel}>Tx:</span> {pendingTx}
        </p>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        {phase === "committed" && (
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onReveal}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
            Reveal
          </button>
        )}

        {phase === "won" && (
          <>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onCashOut}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
              Cash Out
            </button>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onContinue}
              disabled={loading}
              aria-busy={loading}
            >
              Continue Streak
            </button>
          </>
        )}
      </div>
    </div>
  );
}
