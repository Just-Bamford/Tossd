import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./MobileMenu.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

const EXIT_MS = 220;

export function MobileMenu({ open, onClose, triggerRef, children }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Mount/unmount with animation timing
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setAnimateOpen(true));
      return () => cancelAnimationFrame(id);
    }
    setAnimateOpen(false);
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Focus first item on open; return focus on close
  useLayoutEffect(() => {
    if (!mounted || !animateOpen) return;
    const menu = menuRef.current;
    if (menu) {
      const focusables = getFocusable(menu);
      (focusables[0] ?? menu).focus();
    }
    return () => {
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [mounted, animateOpen, triggerRef]);

  // ESC closes
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onCloseRef.current(); return; }
    if (e.key !== "Tab" || !menuRef.current) return;

    const focusables = getFocusable(menuRef.current);
    if (!focusables.length) { e.preventDefault(); return; }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first) { e.preventDefault(); last.focus(); }
    } else {
      if (active === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={[styles.backdrop, animateOpen ? styles.backdropOpen : ""].join(" ")}
        aria-hidden="true"
        onClick={() => onCloseRef.current()}
      />
      {/* Menu panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[styles.menu, animateOpen ? styles.menuOpen : ""].join(" ")}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {children}
      </div>
    </>
  );
}
