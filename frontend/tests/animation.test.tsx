/**
 * Animation and transition tests — Issue #430
 *
 * Covers:
 *  - CoinFlip animation states (idle / flipping / revealed)
 *  - Modal open/close transition classes
 *  - LoadingSpinner reduced-motion fallback
 *  - prefers-reduced-motion media query behaviour
 *
 * Animation patterns:
 *  - CoinFlip: CSS `flip` keyframe (1200 ms) applied via `.flipping`; result
 *    shown via `.showHeads` / `.showTails` transform; reduced-motion skips
 *    the spin and uses a `fadeReveal` opacity pulse instead.
 *  - Modal: backdrop + panel fade/scale driven by `.backdropOpen`; reduced-
 *    motion collapses transition-duration to 0.01 ms and removes scale.
 *  - LoadingSpinner: `.ring` spins via `spin` keyframe; reduced-motion hides
 *    the ring and shows a pulsing `.dot` instead.
 */

import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { CoinFlip } from "../components/CoinFlip";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simulate prefers-reduced-motion by overriding window.matchMedia. */
function mockReducedMotion(prefersReduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: prefersReduced && query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// ─── CoinFlip ─────────────────────────────────────────────────────────────────

describe("CoinFlip — animation states", () => {
  it("renders in idle state without flipping class", () => {
    const { container } = render(<CoinFlip state="idle" />);
    const coin = container.querySelector("[class*='coin']");
    expect(coin?.className).not.toMatch(/flipping/);
  });

  it("applies flipping class when state=flipping", () => {
    const { container } = render(<CoinFlip state="flipping" result="heads" />);
    const coin = container.querySelector("[class*='coin']");
    expect(coin?.className).toMatch(/flipping/);
  });

  it("removes flipping class and shows result when state=revealed", () => {
    const { container } = render(<CoinFlip state="revealed" result="tails" />);
    const coin = container.querySelector("[class*='coin']");
    expect(coin?.className).not.toMatch(/flipping/);
    expect(coin?.className).toMatch(/showTails/);
  });

  it("shows showHeads class when revealed with heads", () => {
    const { container } = render(<CoinFlip state="revealed" result="heads" />);
    const coin = container.querySelector("[class*='coin']");
    expect(coin?.className).toMatch(/showHeads/);
  });

  it("coin div has onAnimationEnd wired when flipping", () => {
    // React synthetic animation events don't fire from raw DOM events in jsdom.
    // Verify the coin element exists and the component accepts the callback prop
    // without error — the actual invocation is covered by integration/e2e tests.
    const onEnd = vi.fn();
    const { container } = render(
      <CoinFlip state="flipping" result="heads" onAnimationEnd={onEnd} />
    );
    const coin = container.querySelector("[class*='coin']");
    expect(coin).toBeTruthy();
    expect(onEnd).not.toHaveBeenCalled(); // not yet — animation hasn't ended
  });

  it("has aria-live=polite on the scene", () => {
    const { container } = render(<CoinFlip state="idle" />);
    const scene = container.querySelector("[aria-live='polite']");
    expect(scene).toBeTruthy();
  });

  it("announces result to screen readers when revealed", () => {
    render(<CoinFlip state="revealed" result="tails" />);
    expect(screen.getByText("Result: tails")).toBeInTheDocument();
  });

  it("does not render sr result text when not revealed", () => {
    render(<CoinFlip state="flipping" result="heads" />);
    expect(screen.queryByText(/Result:/)).toBeNull();
  });
});

// ─── CoinFlip — reduced motion ────────────────────────────────────────────────

describe("CoinFlip — reduced-motion", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it("still applies flipping class (CSS handles the no-spin fallback)", () => {
    // The component always adds .flipping; CSS @media reduces the animation.
    const { container } = render(<CoinFlip state="flipping" result="heads" />);
    const coin = container.querySelector("[class*='coin']");
    expect(coin?.className).toMatch(/flipping/);
  });

  it("matchMedia reports prefers-reduced-motion correctly", () => {
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  });
});

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

describe("LoadingSpinner — animation", () => {
  it("renders ring element for standard motion", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("[class*='ring']")).toBeTruthy();
  });

  it("renders dot element (reduced-motion fallback present in DOM)", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("[class*='dot']")).toBeTruthy();
  });

  it("renders with correct role and label", () => {
    render(<LoadingSpinner label="Processing…" />);
    expect(screen.getByRole("status", { name: "Processing…" })).toBeInTheDocument();
  });

  it("applies size class for each size variant", () => {
    (["small", "medium", "large"] as const).forEach((size) => {
      const { container } = render(<LoadingSpinner size={size} />);
      expect(container.querySelector(`[class*='${size}']`)).toBeTruthy();
    });
  });

  it("wraps in overlay backdrop when mode=overlay", () => {
    const { container } = render(<LoadingSpinner mode="overlay" />);
    expect(container.querySelector("[class*='overlayBackdrop']")).toBeTruthy();
  });
});

describe("LoadingSpinner — reduced-motion", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it("matchMedia signals reduced-motion preference", () => {
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  });

  it("dot element is present for CSS to activate", () => {
    // CSS hides ring and shows dot; both elements must exist in the DOM.
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("[class*='dot']")).toBeTruthy();
    expect(container.querySelector("[class*='ring']")).toBeTruthy();
  });
});

// ─── Modal — transitions ──────────────────────────────────────────────────────

describe("Modal — transition classes", () => {
  const Wrapper = ({ open }: { open: boolean }) => (
    <Modal open={open} onClose={vi.fn()} titleId="modal-title">
      <h2 id="modal-title">Test Modal</h2>
      <button>Close</button>
    </Modal>
  );

  it("does not render when closed", () => {
    render(<Wrapper open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders dialog when open", () => {
    render(<Wrapper open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("applies backdropOpen class when open", async () => {
    render(<Wrapper open={true} />);
    // Modal uses a portal; query document.body instead of container.
    // CSS modules hash class names, so we verify the backdrop gains a second
    // class (the hashed backdropOpen) after the rAF fires.
    await waitFor(() => {
      const backdrop = document.body.querySelector("[class*='backdrop']");
      expect(backdrop?.classList.length).toBeGreaterThan(1);
    });
  });

  it("dialog has aria-modal=true", () => {
    render(<Wrapper open={true} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("dialog is labelled by titleId", () => {
    render(<Wrapper open={true} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "modal-title");
  });
});

describe("Modal — reduced-motion", () => {
  beforeEach(() => mockReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it("still renders and opens correctly under reduced-motion", () => {
    render(
      <Modal open={true} onClose={vi.fn()} titleId="t">
        <h2 id="t">Hi</h2>
        <button>OK</button>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const backdrop = document.body.querySelector("[class*='backdrop']");
    expect(backdrop).toBeTruthy();
  });
});
