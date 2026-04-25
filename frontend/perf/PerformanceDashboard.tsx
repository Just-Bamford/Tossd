/**
 * PerformanceDashboard — #323
 *
 * Renders a compact overlay showing live Core Web Vitals.
 * Only visible in development (NODE_ENV !== "production").
 *
 * Usage:
 *   import { PerformanceDashboard } from "./perf/PerformanceDashboard";
 *   // Mount once near the root of your app:
 *   <PerformanceDashboard />
 */

import React, { useEffect, useState } from "react";
import { initPerformanceMonitoring, VitalMetric } from "./vitals";

const RATING_COLOR: Record<VitalMetric["rating"], string> = {
  good: "#1D7A45",
  "needs-improvement": "#B5681D",
  poor: "#A12A2A",
};

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<VitalMetric[]>([]);

  useEffect(() => {
    initPerformanceMonitoring((m) => {
      setMetrics((prev) => {
        const idx = prev.findIndex((x) => x.name === m.name);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = m;
          return next;
        }
        return [...prev, m];
      });
    });
  }, []);

  if (process.env.NODE_ENV === "production") return null;
  if (metrics.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Performance metrics"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: "rgba(23,23,23,0.92)",
        color: "#fff",
        borderRadius: 10,
        padding: "12px 16px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 12,
        lineHeight: 1.6,
        minWidth: 200,
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>
        ⚡ Web Vitals
      </div>
      {metrics.map((m) => (
        <div key={m.name} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#aaa" }}>{m.name}</span>
          <span style={{ color: RATING_COLOR[m.rating], fontWeight: 600 }}>
            {m.value.toFixed(m.name === "CLS" ? 3 : 0)}
            {m.name === "CLS" ? "" : "ms"}
          </span>
        </div>
      ))}
    </div>
  );
}
