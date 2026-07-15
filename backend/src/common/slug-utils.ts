/**
 * Shared slugification utilities for the backend.
 *
 * Normalizes Polish characters to ASCII so URL slugs are consistent
 * across the entire application (e.g. "Białystok" → "bialystok",
 * "Studio Tańca Feniks" → "studio-tanca-feniks").
 */

export function slugifyToAscii(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-|-$/g, '');
}
