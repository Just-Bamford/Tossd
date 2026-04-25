import React from "react";
import styles from "./LoadingSpinner.module.css";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerMode = "inline" | "overlay";

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  mode?: SpinnerMode;
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  mode = "inline",
  label = "Loading…",
  className,
}: LoadingSpinnerProps) {
  const sizeClass = styles[size];
  const modeClass = mode === "overlay" ? styles.overlay : styles.inline;

  const spinner = (
    <span
      role="status"
      aria-label={label}
      className={[styles.root, sizeClass, className ?? ""].filter(Boolean).join(" ")}
    >
      {/* Visible to screen readers only */}
      <span className={styles.srOnly}>{label}</span>
      {/* Spinning ring — hidden in reduced-motion via CSS */}
      <span className={styles.ring} aria-hidden="true" />
      {/* Pulsing dot — shown only in reduced-motion via CSS */}
      <span className={styles.dot} aria-hidden="true" />
    </span>
  );

  if (mode === "overlay") {
    return (
      <div className={[styles.overlayBackdrop, className ?? ""].filter(Boolean).join(" ")}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
