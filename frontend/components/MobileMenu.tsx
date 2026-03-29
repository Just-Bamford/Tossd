import React, { useCallback, useEffect, useRef } from "react";
import styles from "./MobileMenu.module.css";

const NAV_LINKS = [
  { label: "Play", href: "#play" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Fairness", href: "#fairness" },
  { label: "Economics", href: "#economics" },
  { label: "Audit Contract", href: "https://github.com/Tossd-Org/Tossd", external: true },
];

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  // Focus first link when opened
  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={[styles.overlay, open ? styles.overlayVisible : ""].filter(Boolean).join(" ")}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <nav
        ref={menuRef}
        id="mobile-menu"
        className={[styles.menu, open ? styles.menuOpen : ""].filter(Boolean).join(" ")}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <span className={styles.brand}>Tossd</span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            {/* X icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className={styles.navList} role="list">
          {NAV_LINKS.map(({ label, href, external }) => (
            <li key={label}>
              <a
                href={href}
                className={styles.navLink}
                onClick={external ? undefined : onClose}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {label}
                {external && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={styles.externalIcon}>
                    <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <a href="#play" className={styles.ctaBtn} onClick={onClose}>
            Launch Tossd
          </a>
        </div>
      </nav>
    </>
  );
}
