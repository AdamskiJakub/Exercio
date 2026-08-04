/**
 * Market configuration and available cities.
 *
 * Single source of truth for which cities are available in the app.
 * Everything else (CityAutocomplete, forms, search) uses `getAvailableCities()`,
 * so moving from one city to many cities or the whole of Poland is a config
 * change, not a component rewrite.
 *
 * Market modes (`NEXT_PUBLIC_MARKET_MODE`):
 *  - "beachhead" — one city (DEFAULT_CITY). The field is locked.
 *  - "limited"   — a few cities from SUPPORTED_CITIES. Autocomplete is limited
 *                  to those cities only.
 *  - "open"      — the whole of Poland (all cities from polish-cities).
 *
 * Today:      MARKET_MODE=beachhead, DEFAULT_CITY=Białystok
 * In 6 months: MARKET_MODE=limited, SUPPORTED_CITIES=["Białystok","Warszawa"]
 * In 2 years:  MARKET_MODE=open (no code changes).
 */

export type MarketMode = "beachhead" | "limited" | "open";

/**
 * Result of `getAvailableCities()`.
 *  - "ALL"       — every city from polish-cities is available (open mode).
 *  - string[]    — only these city names are available (beachhead/limited).
 */
export type AvailableCities = "ALL" | readonly string[];

const rawMarketMode = process.env.NEXT_PUBLIC_MARKET_MODE?.trim().toLowerCase();

export const MARKET_MODE: MarketMode =
  rawMarketMode === "limited" || rawMarketMode === "open"
    ? rawMarketMode
    : "beachhead";

const configuredCity = process.env.NEXT_PUBLIC_BEACHHEAD_CITY?.trim() || null;

/**
 * Cities in "limited" mode. In "beachhead" mode it only contains DEFAULT_CITY.
 * Ignored in "open" mode (all Polish cities are available).
 */
export const SUPPORTED_CITIES: readonly string[] = configuredCity
  ? [configuredCity]
  : [];

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

/**
 * Default (only) city in "beachhead" mode, or `null` when the app supports
 * multiple cities. Components just check `if (DEFAULT_CITY)`.
 */
export const DEFAULT_CITY: string | null = configuredCity;

/**
 * Whether the city field should be locked (readOnly). Only true in
 * "beachhead" mode with DEFAULT_CITY set.
 */
export const isCityLocked = MARKET_MODE === "beachhead" && !!DEFAULT_CITY;

/**
 * Centralized source of available cities.
 *
 * Returns the city names the user can pick, or "ALL" when every city from
 * polish-cities is available (open mode). "ALL" is an explicit signal — not
 * `null`, which would read like an error.
 */
export function getAvailableCities(): AvailableCities {
  switch (MARKET_MODE) {
    case "beachhead":
      return DEFAULT_CITY ? [DEFAULT_CITY] : [];
    case "limited":
      return SUPPORTED_CITIES;
    case "open":
      return "ALL";
    default:
      return DEFAULT_CITY ? [DEFAULT_CITY] : [];
  }
}
