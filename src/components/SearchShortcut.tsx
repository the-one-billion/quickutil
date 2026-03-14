"use client";
import { useEffect } from "react";

/** Pressing "/" anywhere on the page focuses the main search input. */
export default function SearchShortcut() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ignore if already typing in an input/textarea/select/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = (e.target as HTMLElement).isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || isEditable) return;
      if (e.key !== "/") return;

      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>('[aria-label="Search tools"]');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return null;
}
