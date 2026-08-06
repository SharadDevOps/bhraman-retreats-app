"use client";

import { useEffect } from "react";

/**
 * Picks one of the five Bhraman elements at random on every page load
 * and applies it as a class to <html> so CSS variables take effect globally.
 *
 * Elements:
 *  theme-earth  → clay / terracotta
 *  theme-water  → amber / warm orange
 *  theme-fire   → gold / saffron
 *  theme-air    → forest / sage green
 *  theme-space  → deep teal / slate
 */
const ELEMENTS = ["earth", "water", "fire", "air", "space"] as const;

export function ThemeProvider() {
  useEffect(() => {
    const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    // Remove any existing theme-* class first
    document.documentElement.classList.forEach((cls) => {
      if (cls.startsWith("theme-")) document.documentElement.classList.remove(cls);
    });
    document.documentElement.classList.add(`theme-${el}`);
  }, []);

  return null;
}
