import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && isVisible(el)
  );
}

function isVisible(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** `id` of the visible modal title inside `children` (links `aria-labelledby`). */
  titleId: string;
  /** Optional `id` of descriptive copy inside `children` (`aria-describedby`). */
  descriptionId?: string;
  children: React.ReactNode;
  /** Extra class on the backdrop / dialog root. */
  className?: string;
  /** Extra class on the inner panel (focus trap container). */
  panelClassName?: string;
  /** When false, overlay clicks do not call `onClose`. Default true. */
  closeOnOverlayClick?: boolean;
  /** Focus this element on open; otherwise the first focusable descendant of the panel. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const EXIT_MS = 220;

export function Modal({
  open,
  onClose,
  titleId,
  descriptionId,
  children,
  className,
  panelClassName,
  closeOnOverlayClick = true,
  initialFocusRef,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = React.useState(false);
  const [animateOpen, setAnimateOpen] = React.useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setAnimateOpen(true));
      return () => cancelAnimationFrame(id);
    }
    setAnimateOpen(false);
    const t = window.setTimeout(() => {
      setMounted((m) => (m ? false : m));
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted || !animateOpen) return;
    const previous = document.activeElement;
    if (previous instanceof HTMLElement) {
      previousFocusRef.current = previous;
    }

    const panel = panelRef.current;
    if (panel) {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusables = getFocusableElements(panel);
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          panel.focus();
        }
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus({ preventScroll: true });
      previousFocusRef.current = null;
    };
  }, [mounted, animateOpen, initialFocusRef]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = getFocusableElements(panelRef.current);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const panel = panelRef.current;

      if (active === panel) {
        event.preventDefault();
        if (event.shiftKey) last.focus();
        else first.focus();
        return;
      }

      if (!(active instanceof Node) || !panel.contains(active)) {
        event.preventDefault();
        if (event.shiftKey) last.focus();
        else first.focus();
        return;
      }

      if (event.shiftKey) {
        if (active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    []
  );

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) return;
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const backdropClassName = [
    styles.backdrop,
    animateOpen ? styles.backdropOpen : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const panelClassNames = [styles.panel, panelClassName ?? ""].filter(Boolean).join(" ");

  const dialog = (
    <div
      ref={backdropRef}
      className={backdropClassName}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      {...(descriptionId ? { "aria-describedby": descriptionId } : {})}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={panelClassNames}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
