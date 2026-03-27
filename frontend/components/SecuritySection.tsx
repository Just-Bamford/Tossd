import React from "react";
import styles from "./SecuritySection.module.css";

interface SecurityFeature {
  icon: string;
  label: string;
  detail: string;
}

interface StatCard {
  value: string;
  label: string;
}

const FEATURES: SecurityFeature[] = [
  {
    icon: "✓",
    label: "Commit-Reveal Randomness",
    detail: "Neither party can bias the XOR-based outcome without controlling both secrets simultaneously.",
  },
  {
    icon: "✓",
    label: "Reserve Solvency Checks",
    detail: "Contract rejects new games when reserves fall below the worst-case 10x payout.",
  },
  {
    icon: "✓",
    label: "Access-Controlled Admin",
    detail: "Admin can pause new games and adjust parameters, but cannot touch player funds or in-flight state.",
  },
  {
    icon: "✓",
    label: "Overflow-Safe Arithmetic",
    detail: "All calculations use checked_* operations — no silent wraps or panics.",
  },
  {
    icon: "✓",
    label: "Fee Snapshot Isolation",
    detail: "Fee rate is locked per game at start_game time; admin changes only affect future games.",
  },
  {
    icon: "✓",
    label: "Timeout Recovery",
    detail: "Players can reclaim wagers if reveal is abandoned after the timeout window.",
  },
];

const STATS: StatCard[] = [
  { value: "132", label: "Tests passing" },
  { value: "30+", label: "Property-based checks" },
  { value: "0", label: "Failures" },
  { value: "17", label: "Error variants" },
];

export function SecuritySection() {
  return (
    <section className={styles.section} aria-labelledby="security-heading">
      <h2 id="security-heading" className={styles.heading}>
        Security &amp; Testing Proof
      </h2>

      <div className={styles.layout}>
        {/* Security bullets */}
        <div className={styles.featuresCol}>
          <ul className={styles.featureList} role="list">
            {FEATURES.map((f) => (
              <li key={f.label} className={styles.featureItem}>
                <span className={styles.icon} aria-hidden="true">{f.icon}</span>
                <div>
                  <span className={styles.featureLabel}>{f.label}</span>
                  <p className={styles.featureDetail}>{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats cards */}
        <div className={styles.statsCol} aria-label="Testing statistics">
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
