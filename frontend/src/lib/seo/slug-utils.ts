/**
 * Utility functions for URL slug normalization and city name handling.
 *
 * These functions are used across SEO pages, reserved-slugs, and server components.
 * They MUST NOT import from "use client" modules.
 */

/** Normalize a city name to a URL slug (e.g. "Białystok" → "bialystok") */
export function slugifyCity(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-ząćęłńóśźż0-9-]/g, "");
}

/** Convert a URL slug back to a city name (e.g. "bialystok" → "Białystok") */
export function deslugifyCity(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Normalize any slug for comparison (lowercase, trimmed) */
export function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim();
}
