import React, { useEffect, useState } from "react";
import styles from "./CoinFlip.module.css";

export type CoinFace = "heads" | "tails";
export type CoinFlipState = "idle" | "flipping" | "revealed";

interface CoinFlipProps {
  result?: CoinFace;
  state?: CoinFlipState;
  onAnimationEnd?: () => void;
}

export function CoinFlip({
  result = "heads",
  state = "idle",
  onAnimationEnd,
}: CoinFlipProps) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (state === "flipping") {
      setSettled(false);
    }
    if (state === "revealed") {
      setSettled(true);
    }
  }, [state]);

  const isFlipping = state === "flipping";
  // When revealed: heads = 0deg (front face), tails = 180deg (back face)
  const revealedRotation = settled
    ? result === "heads"
      ? styles.showHeads
      : styles.showTails
    : "";

  return (
    <div
      className={styles.scene}
      aria-label={
        state === "revealed"
          ? `Coin landed on ${result}`
          : state === "flipping"
          ? "Coin is flipping"
          : "Coin"
      }
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={[
          styles.coin,
          isFlipping ? styles.flipping : "",
          revealedRotation,
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={() => {
          if (isFlipping) onAnimationEnd?.();
        }}
      >
        {/* Heads face */}
        <div className={`${styles.face} ${styles.heads}`} aria-hidden="true">
          <span className={styles.faceSymbol}>H</span>
          <span className={styles.faceLabel}>Heads</span>
        </div>

        {/* Tails face */}
        <div className={`${styles.face} ${styles.tails}`} aria-hidden="true">
          <span className={styles.faceSymbol}>T</span>
          <span className={styles.faceLabel}>Tails</span>
        </div>
      </div>

      {/* Screen-reader result announcement */}
      {state === "revealed" && (
        <p className={styles.srOnly}>Result: {result}</p>
      )}
    </div>
  );
}
