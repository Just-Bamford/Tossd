import React from "react";
import styles from "./Grid.module.css";

// ── Types ───────────────────────────────────────────────────────────────────
type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type Gap = "none" | "sm" | "md" | "lg";

export interface GridProps {
  /** Number of columns on desktop (≥ 901 px). Default 12. */
  cols?: Cols;
  /** Number of columns on tablet (481–900 px). Default half of `cols`, min 1. */
  colsMd?: Cols;
  /** Number of columns on mobile (≤ 480 px). Default 4. */
  colsSm?: Cols;
  /** Gap between cells using spacing tokens. Default "md". */
  gap?: Gap;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}

export interface GridItemProps {
  /** Columns to span on desktop. Default 1. */
  span?: Cols;
  /** Columns to span on tablet. Falls back to `span`. */
  spanMd?: Cols;
  /** Columns to span on mobile. Falls back to full row. */
  spanSm?: Cols;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}

// ── Grid ────────────────────────────────────────────────────────────────────
export function Grid({
  cols = 12,
  colsMd,
  colsSm = 4,
  gap = "md",
  as: Tag = "div",
  className,
  children,
}: GridProps) {
  const resolvedMd = colsMd ?? (Math.max(1, Math.floor(cols / 2)) as Cols);

  return (
    <Tag
      className={[styles.grid, styles[`gap-${gap}`], className].filter(Boolean).join(" ")}
      style={
        {
          "--grid-cols": cols,
          "--grid-cols-md": resolvedMd,
          "--grid-cols-sm": colsSm,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

// ── GridItem ─────────────────────────────────────────────────────────────────
export function GridItem({
  span = 1,
  spanMd,
  spanSm,
  as: Tag = "div",
  className,
  children,
}: GridItemProps) {
  return (
    <Tag
      className={[styles.item, className].filter(Boolean).join(" ")}
      style={
        {
          "--item-span": span,
          "--item-span-md": spanMd ?? span,
          "--item-span-sm": spanSm ?? "var(--grid-cols-sm)", // full row on mobile by default
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
