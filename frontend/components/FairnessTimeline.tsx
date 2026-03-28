import React from "react";
import styles from "./FairnessTimeline.module.css";

const STEPS = [
  {
    title: "Commit",
    caption: "Player submits a hash of their secret before the flip. The contract cannot know the secret in advance.",
    example: "commitHash: 0x3a7f…c91b",
    icon: (
      <svg className={styles.icon} viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Reveal",
    caption: "Player reveals their secret. The on-chain XOR of both secrets determines the outcome — neither party can bias it.",
    example: "revealSecret: 0x8d2e…44fa",
    icon: (
      <svg className={styles.icon} viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 9c1.8-4 10.2-4 14 0-3.8 4-12.2 4-14 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Settle",
    caption: "Payout is computed deterministically on-chain. The result is auditable by anyone with the transaction ID.",
    example: "txId: 0xf19c…7a30",
    icon: (
      <svg className={styles.icon} viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3.5 9.5l3.5 3.5 7.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function FairnessTimeline() {
  return (
    <ol className={styles.timeline} aria-label="Commit-reveal fairness steps">
      {STEPS.map((step, i) => (
        <li key={step.title} className={styles.step}>
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.badge}>{i + 1}</span>
            <span className={styles.connector} />
          </div>
          <div className={styles.content}>
            {step.icon}
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.caption}>{step.caption}</p>
            <span className={styles.hash}>{step.example}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
