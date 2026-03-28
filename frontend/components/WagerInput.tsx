import React, { useState, useId } from "react";
import styles from "./WagerInput.module.css";

interface WagerInputProps {
  min?: number;
  max?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function validate(raw: string, min: number, max: number): string | null {
  if (raw === "" || raw === ".") return null;
  const n = parseFloat(raw);
  if (isNaN(n)) return "Enter a valid number.";
  if (n < min) return `Minimum wager is ${min} XLM.`;
  if (n > max) return `Maximum wager is ${max} XLM.`;
  return null;
}

export function WagerInput({
  min = 1,
  max = 10000,
  value: controlledValue,
  onChange,
  disabled = false,
}: WagerInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const error = validate(value, min, max);
  const hasError = error !== null && value !== "" && value !== ".";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow digits, one leading dot, and up to 7 decimal places (XLM precision)
    if (!/^(\d*\.?\d{0,7})$/.test(raw)) return;
    if (!isControlled) setInternalValue(raw);
    onChange?.(raw);
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        Wager amount
      </label>

      <div className={`${styles.inputRow} ${hasError ? styles.inputRowError : ""} ${disabled ? styles.inputRowDisabled : ""}`}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={styles.input}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          aria-describedby={`${hintId} ${hasError ? errorId : ""}`.trim()}
          aria-invalid={hasError}
        />
        <span className={styles.suffix} aria-hidden="true">
          XLM
        </span>
      </div>

      {hasError ? (
        <p id={errorId} className={styles.error} role="alert">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5zm0 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" />
          </svg>
          {error}
        </p>
      ) : null}

      <p id={hintId} className={styles.hint}>
        Min {min} XLM &mdash; Max {max.toLocaleString()} XLM
      </p>
    </div>
  );
}
