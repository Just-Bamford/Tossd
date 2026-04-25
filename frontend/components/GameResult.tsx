import React, { useEffect, useRef } from "react";
import styles from "./GameResult.module.css";

export interface GameResultProps {
  outcome: "win" | "loss";
  wager: number;
  payout?: number;
  streak?: number;
  onContinue?: () => void;
  onCashOut?: () => void;
  onPlayAgain?: () => void;
}

/** Lightweight confetti burst — no external deps. */
function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const COLORS = ["#0F766E", "#1D7A45", "#DDF3F0", "#B5681D", "#171717"];
    const particles = Array.from({ length: 60 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 80,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 6 + 2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    }));

    let frame: number;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.012;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className={styles.confettiCanvas} aria-hidden="true" />;
}

export function GameResult({
  outcome,
  wager,
  payout,
  streak = 0,
  onContinue,
  onCashOut,
  onPlayAgain,
}: GameResultProps) {
  const isWin = outcome === "win";

  return (
    <div
      className={[styles.root, isWin ? styles.win : styles.loss].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={isWin ? "You won!" : "You lost"}
    >
      {isWin && <ConfettiBurst />}

      <div className={styles.iconWrap} aria-hidden="true">
        {isWin ? (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="var(--color-brand-accent-soft)" />
            <path d="M14 25l7 7 13-14" stroke="var(--color-state-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#FAE8E8" />
            <path d="M17 17l14 14M31 17L17 31" stroke="var(--color-state-danger)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h2 className={styles.headline}>
        {isWin ? (streak > 0 ? `${streak + 1}-Win Streak!` : "You Won!") : "Better Luck Next Time"}
      </h2>

      <p className={styles.subtext}>
        {isWin
          ? `Payout: ${payout !== undefined ? (payout / 10_000_000).toFixed(4) : "—"} XLM`
          : `Wager of ${(wager / 10_000_000).toFixed(4)} XLM forfeited`}
      </p>

      <div className={styles.actions}>
        {isWin && onCashOut && (
          <button className={styles.btnPrimary} onClick={onCashOut}>
            Cash Out
          </button>
        )}
        {isWin && onContinue && (
          <button className={styles.btnSecondary} onClick={onContinue}>
            Continue Streak
          </button>
        )}
        {!isWin && onPlayAgain && (
          <button className={styles.btnPrimary} onClick={onPlayAgain}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
