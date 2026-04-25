/**
 * Error boundary tests — Issue #431
 *
 * Covers:
 *  - ErrorBoundary catches render errors and shows default fallback
 *  - Default fallback UI content and accessibility
 *  - showDetails prop exposes error.message
 *  - Custom fallback (ReactNode and render-prop forms)
 *  - onError logging callback
 *  - Reset via "Try again" button
 *  - resetKeys prop triggers automatic reset
 *  - Nested boundaries: inner catches first, outer untouched
 *
 * Error handling strategy:
 *  - ErrorBoundary wraps any subtree that may throw during render.
 *  - The default fallback gives users two recovery paths: reset (Try again)
 *    and hard reload. Custom fallbacks can be passed as a ReactNode or a
 *    render-prop `(error, resetErrorBoundary) => ReactNode`.
 *  - onError is the integration point for external logging (e.g. Sentry).
 *  - resetKeys lets parent state changes automatically clear the error state
 *    without requiring a user action.
 *  - Nested boundaries isolate failures: an inner boundary catches its own
 *    subtree's errors and leaves sibling/ancestor trees unaffected.
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ErrorBoundary } from "../components/ErrorBoundary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Component that throws on first render. */
function Bomb({ message = "boom" }: { message?: string }) {
  throw new Error(message);
}

/** Component that throws only when `shouldThrow` is true. */
function ConditionalBomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("conditional boom");
  return <p>safe</p>;
}

// Suppress expected console.error noise from React's error boundary logging.
beforeEach(() => { vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

// ─── Catching errors ──────────────────────────────────────────────────────────

describe("ErrorBoundary — catching errors", () => {
  it("renders children when no error is thrown", () => {
    render(<ErrorBoundary><p>ok</p></ErrorBoundary>);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("catches a render error and shows the default fallback", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("does not render children after an error", () => {
    render(<ErrorBoundary><Bomb /><p>should not appear</p></ErrorBoundary>);
    expect(screen.queryByText("should not appear")).toBeNull();
  });
});

// ─── Default fallback UI ──────────────────────────────────────────────────────

describe("ErrorBoundary — default fallback UI", () => {
  it("renders role=alert for immediate screen-reader announcement", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a 'Try again' button", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("renders a 'Reload page' button", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
  });

  it("hides error details by default", () => {
    render(<ErrorBoundary><Bomb message="secret" /></ErrorBoundary>);
    expect(screen.queryByText("secret")).toBeNull();
  });

  it("shows error.message when showDetails=true", () => {
    render(<ErrorBoundary showDetails><Bomb message="exposed error" /></ErrorBoundary>);
    expect(screen.getByText("exposed error")).toBeInTheDocument();
  });
});

// ─── onError logging ──────────────────────────────────────────────────────────

describe("ErrorBoundary — onError logging", () => {
  it("calls onError with the thrown Error instance", () => {
    const onError = vi.fn();
    render(<ErrorBoundary onError={onError}><Bomb message="log me" /></ErrorBoundary>);
    expect(onError).toHaveBeenCalledOnce();
    const [err] = onError.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("log me");
  });

  it("calls onError with errorInfo containing componentStack", () => {
    const onError = vi.fn();
    render(<ErrorBoundary onError={onError}><Bomb /></ErrorBoundary>);
    const [, errorInfo] = onError.mock.calls[0];
    expect(typeof errorInfo.componentStack).toBe("string");
  });
});

// ─── Custom fallbacks ─────────────────────────────────────────────────────────

describe("ErrorBoundary — custom fallbacks", () => {
  it("renders a ReactNode fallback", () => {
    render(
      <ErrorBoundary fallback={<p>custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("custom fallback")).toBeInTheDocument();
  });

  it("renders a render-prop fallback with error and reset", () => {
    const fallback = vi.fn(({ error }: { error: Error; resetErrorBoundary: () => void }) => (
      <p>render-prop: {error.message}</p>
    ));
    render(<ErrorBoundary fallback={fallback}><Bomb message="rp-error" /></ErrorBoundary>);
    expect(screen.getByText("render-prop: rp-error")).toBeInTheDocument();
    expect(fallback).toHaveBeenCalled();
  });
});

// ─── Error recovery ───────────────────────────────────────────────────────────

describe("ErrorBoundary — error recovery", () => {
  it("resets and re-renders children after 'Try again'", () => {
    function Recoverable() {
      const [boom, setBoom] = useState(true);
      return (
        <ErrorBoundary onReset={() => setBoom(false)}>
          {boom ? <Bomb /> : <p>recovered</p>}
        </ErrorBoundary>
      );
    }
    render(<Recoverable />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("recovered")).toBeInTheDocument();
  });

  it("calls onReset when reset is triggered", () => {
    const onReset = vi.fn();
    function Wrapper() {
      const [boom, setBoom] = useState(true);
      return (
        <ErrorBoundary onReset={() => { onReset(); setBoom(false); }}>
          {boom ? <Bomb /> : <p>ok</p>}
        </ErrorBoundary>
      );
    }
    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("resets automatically when resetKeys change", () => {
    function KeyedWrapper() {
      const [key, setKey] = useState(0);
      const [boom, setBoom] = useState(true);
      return (
        <>
          <button onClick={() => { setBoom(false); setKey((k) => k + 1); }}>
            fix
          </button>
          <ErrorBoundary resetKeys={[key]}>
            {boom ? <Bomb /> : <p>auto-recovered</p>}
          </ErrorBoundary>
        </>
      );
    }
    render(<KeyedWrapper />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "fix" }));
    expect(screen.getByText("auto-recovered")).toBeInTheDocument();
  });
});

// ─── Nested boundaries ────────────────────────────────────────────────────────

describe("ErrorBoundary — nested boundaries", () => {
  it("inner boundary catches its own error, outer children unaffected", () => {
    render(
      <ErrorBoundary fallback={<p>outer fallback</p>}>
        <p>outer content</p>
        <ErrorBoundary fallback={<p>inner fallback</p>}>
          <Bomb />
        </ErrorBoundary>
      </ErrorBoundary>
    );
    expect(screen.getByText("inner fallback")).toBeInTheDocument();
    expect(screen.getByText("outer content")).toBeInTheDocument();
    expect(screen.queryByText("outer fallback")).toBeNull();
  });

  it("outer boundary catches when inner has no boundary", () => {
    render(
      <ErrorBoundary fallback={<p>outer caught</p>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("outer caught")).toBeInTheDocument();
  });

  it("sibling boundaries are independent", () => {
    render(
      <div>
        <ErrorBoundary fallback={<p>left fallback</p>}><Bomb /></ErrorBoundary>
        <ErrorBoundary fallback={<p>right ok</p>}><p>right content</p></ErrorBoundary>
      </div>
    );
    expect(screen.getByText("left fallback")).toBeInTheDocument();
    expect(screen.getByText("right content")).toBeInTheDocument();
    expect(screen.queryByText("right ok")).toBeNull();
  });
});
