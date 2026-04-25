import React, { useId } from "react";
import styles from "./SideSelector.module.css";

export type CoinSide = "heads" | "tails";

export interface SideSelectorProps {
  value: CoinSide;
  onChange: (side: CoinSide) => void;
  disabled?: boolean;
}

const SIDES: { id: CoinSide; label: string; symbol: string }[] = [
  { id: "heads", label: "Heads", symbol: "H" },
  { id: "tails", label: "Tails", symbol: "T" },
];

export function SideSelector({ value, onChange, disabled = false }: SideSelectorProps) {
  const groupId = useId();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(value === "heads" ? "tails" : "heads");
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Choose coin side"
      className={styles.group}
      onKeyDown={handleKeyDown}
    >
      {SIDES.map((side) => {
        const inputId = `${groupId}-${side.id}`;
        const isSelected = value === side.id;
        return (
          <label
            key={side.id}
            htmlFor={inputId}
            className={`${styles.option} ${isSelected ? styles.selected : ""} ${disabled ? styles.disabled : ""}`}
          >
            <input
              type="radio"
              id={inputId}
              name={groupId}
              value={side.id}
              checked={isSelected}
              onChange={() => onChange(side.id)}
              disabled={disabled}
              className={styles.hiddenInput}
            />
            <span className={styles.symbol} aria-hidden="true">
              {side.symbol}
            </span>
            <span className={styles.label}>{side.label}</span>
          </label>
        );
      })}

      {/* Sliding indicator */}
      <span
        className={styles.indicator}
        style={{ transform: `translateX(${value === "tails" ? "100%" : "0%"})` }}
        aria-hidden="true"
      />
    </div>
  );
}
