/**
 * Unit tests for OutcomeChip, WagerInput, SideSelector, GameStateCard
 * Issue #345 — React Testing Library component tests
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { OutcomeChip } from "../components/OutcomeChip";
import { WagerInput } from "../components/WagerInput";
import { SideSelector, CoinSide } from "../components/SideSelector";
import { GameStateCard, GameState } from "../components/GameStateCard";

// ─── OutcomeChip ─────────────────────────────────────────────────────────────

describe("OutcomeChip", () => {
  it.each(["win", "loss", "pending"] as const)("renders label for state=%s", (state) => {
    render(<OutcomeChip state={state} />);
    const labels = { win: "Win", loss: "Loss", pending: "Pending" };
    expect(screen.getByText(labels[state])).toBeInTheDocument();
  });

  it.each(["win", "loss", "pending"] as const)("has role=status and aria-label for state=%s", (state) => {
    render(<OutcomeChip state={state} />);
    const labels = { win: "Outcome: Win", loss: "Outcome: Loss", pending: "Outcome: Pending" };
    expect(screen.getByRole("status", { name: labels[state] })).toBeInTheDocument();
  });

  it("icons are aria-hidden", () => {
    const { container } = render(<OutcomeChip state="win" />);
    container.querySelectorAll("svg").forEach((svg) =>
      expect(svg).toHaveAttribute("aria-hidden", "true")
    );
  });
});

// ─── WagerInput ──────────────────────────────────────────────────────────────

describe("WagerInput", () => {
  it("renders with empty value by default", () => {
    render(<WagerInput />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("renders label 'Wager amount'", () => {
    render(<WagerInput />);
    expect(screen.getByLabelText(/wager amount/i)).toBeInTheDocument();
  });

  it("shows hint with min/max", () => {
    render(<WagerInput min={1} max={100} />);
    expect(screen.getByText(/min 1 xlm/i)).toBeInTheDocument();
    expect(screen.getByText(/max 100 xlm/i)).toBeInTheDocument();
  });

  it("accepts valid numeric input and calls onChange", () => {
    const onChange = vi.fn();
    render(<WagerInput onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith("5");
  });

  it("shows error for value below minimum", () => {
    render(<WagerInput min={10} max={100} value="5" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/minimum wager is 10/i);
  });

  it("shows error for value above maximum", () => {
    render(<WagerInput min={1} max={10} value="50" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/maximum wager is 10/i);
  });

  it("rejects non-numeric input (no onChange call)", () => {
    const onChange = vi.fn();
    render(<WagerInput onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("input is disabled when disabled=true", () => {
    render(<WagerInput disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("aria-invalid is true when there is an error", () => {
    render(<WagerInput min={10} max={100} value="5" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("aria-invalid is false when value is valid", () => {
    render(<WagerInput min={1} max={100} value="50" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false");
  });

  it("no error shown for empty value", () => {
    render(<WagerInput min={1} max={100} value="" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ─── SideSelector ────────────────────────────────────────────────────────────

function ControlledSideSelector({ initial = "heads" as CoinSide, disabled = false }) {
  const [value, setValue] = useState<CoinSide>(initial);
  return <SideSelector value={value} onChange={setValue} disabled={disabled} />;
}

describe("SideSelector", () => {
  it("renders both Heads and Tails options", () => {
    render(<ControlledSideSelector />);
    expect(screen.getByRole("radio", { name: /heads/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /tails/i })).toBeInTheDocument();
  });

  it("has radiogroup with accessible label", () => {
    render(<ControlledSideSelector />);
    expect(screen.getByRole("radiogroup", { name: /choose coin side/i })).toBeInTheDocument();
  });

  it("initially selected side is checked", () => {
    render(<ControlledSideSelector initial="heads" />);
    expect(screen.getByRole("radio", { name: /heads/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /tails/i })).not.toBeChecked();
  });

  it("clicking the other side selects it", () => {
    render(<ControlledSideSelector initial="heads" />);
    fireEvent.click(screen.getByRole("radio", { name: /tails/i }));
    expect(screen.getByRole("radio", { name: /tails/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /heads/i })).not.toBeChecked();
  });

  it("calls onChange with correct side", () => {
    const onChange = vi.fn();
    render(<SideSelector value="heads" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /tails/i }));
    expect(onChange).toHaveBeenCalledWith("tails");
  });

  it("radios are disabled when disabled=true", () => {
    render(<ControlledSideSelector disabled />);
    screen.getAllByRole("radio").forEach((r) => expect(r).toBeDisabled());
  });

  it("ArrowRight key toggles selection", () => {
    const onChange = vi.fn();
    render(<SideSelector value="heads" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("tails");
  });

  it("ArrowLeft key toggles selection", () => {
    const onChange = vi.fn();
    render(<SideSelector value="tails" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("heads");
  });

  it("arrow keys do nothing when disabled", () => {
    const onChange = vi.fn();
    render(<SideSelector value="heads" onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── GameStateCard ────────────────────────────────────────────────────────────

const BASE_GAME: GameState = {
  phase: "committed",
  side: "heads",
  wagerStroops: 10_000_000,
  streak: 0,
};

describe("GameStateCard", () => {
  it("renders idle message when game is null", () => {
    render(<GameStateCard game={null} />);
    expect(screen.getByText(/start a game/i)).toBeInTheDocument();
  });

  it("renders idle message when phase=idle", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "idle" }} />);
    expect(screen.getByText(/start a game/i)).toBeInTheDocument();
  });

  it("shows 'Awaiting Reveal' badge for committed phase", () => {
    render(<GameStateCard game={BASE_GAME} />);
    expect(screen.getByText("Awaiting Reveal")).toBeInTheDocument();
  });

  it("shows 'You Won!' badge for won phase", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won" }} />);
    expect(screen.getByText("You Won!")).toBeInTheDocument();
  });

  it("shows 'You Lost' badge for lost phase", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "lost" }} />);
    expect(screen.getByText("You Lost")).toBeInTheDocument();
  });

  it("shows 'Timed Out' badge for timed_out phase", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "timed_out" }} />);
    expect(screen.getByText("Timed Out")).toBeInTheDocument();
  });

  it("displays wager formatted as XLM", () => {
    render(<GameStateCard game={BASE_GAME} />);
    expect(screen.getByText("1 XLM")).toBeInTheDocument();
  });

  it("displays correct multiplier for streak 0", () => {
    render(<GameStateCard game={{ ...BASE_GAME, streak: 0 }} />);
    expect(screen.getByText("1.9×")).toBeInTheDocument();
  });

  it("displays correct multiplier for streak 1", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won", streak: 1 }} />);
    expect(screen.getByText("3.5×")).toBeInTheDocument();
  });

  it("displays 10.0× for streak >= 3", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won", streak: 3 }} />);
    expect(screen.getByText("10.0×")).toBeInTheDocument();
  });

  it("displays side", () => {
    render(<GameStateCard game={BASE_GAME} />);
    expect(screen.getByText("heads")).toBeInTheDocument();
  });

  it("displays streak value", () => {
    render(<GameStateCard game={{ ...BASE_GAME, streak: 2 }} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows Reveal button in committed phase", () => {
    render(<GameStateCard game={BASE_GAME} />);
    expect(screen.getByRole("button", { name: /reveal/i })).toBeInTheDocument();
  });

  it("Reveal button calls onReveal", () => {
    const onReveal = vi.fn();
    render(<GameStateCard game={BASE_GAME} onReveal={onReveal} />);
    fireEvent.click(screen.getByRole("button", { name: /reveal/i }));
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it("shows Cash Out and Continue Streak buttons in won phase", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won" }} />);
    expect(screen.getByRole("button", { name: /cash out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue streak/i })).toBeInTheDocument();
  });

  it("Cash Out button calls onCashOut", () => {
    const onCashOut = vi.fn();
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won" }} onCashOut={onCashOut} />);
    fireEvent.click(screen.getByRole("button", { name: /cash out/i }));
    expect(onCashOut).toHaveBeenCalledOnce();
  });

  it("Continue Streak button calls onContinue", () => {
    const onContinue = vi.fn();
    render(<GameStateCard game={{ ...BASE_GAME, phase: "won" }} onContinue={onContinue} />);
    fireEvent.click(screen.getByRole("button", { name: /continue streak/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("buttons are disabled and aria-busy when loading=true", () => {
    render(<GameStateCard game={BASE_GAME} loading />);
    const btn = screen.getByRole("button", { name: /reveal/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("no action buttons in lost phase", () => {
    render(<GameStateCard game={{ ...BASE_GAME, phase: "lost" }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows pending tx hash when provided", () => {
    render(<GameStateCard game={{ ...BASE_GAME, pendingTx: "abc123" }} />);
    expect(screen.getByText("abc123")).toBeInTheDocument();
  });

  it("card has aria-live=polite", () => {
    const { container } = render(<GameStateCard game={BASE_GAME} />);
    expect(container.firstChild).toHaveAttribute("aria-live", "polite");
  });
});
