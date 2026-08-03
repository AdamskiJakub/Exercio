/**
 * Supported cities (beachhead market strategy).
 *
 * MVP obsługuje tylko jedno miasto — Białystok. Gdy `SUPPORTED_CITIES.length === 1`,
 * komponent `CityAutocomplete` renderuje zablokowane pole z tym miastem zamiast
 * pełnego autouzupełniania. Po dodaniu kolejnych miast (np. Warszawa, Lublin)
 * autouzupełnianie wraca automatycznie — bez dodatkowego refaktoru.
 *
 * Uwaga: nazwy muszą dokładnie odpowiadać nazwom z biblioteki `polish-cities`
 * (używane do dopasowania w `useCityAutocomplete`).
 */
export const SUPPORTED_CITIES = ["Białystok"] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

/**
 * Tryb "beachhead market" — aplikacja celowo koncentruje się na jednym mieście
 * (MVP), zamiast udawać platformę ogólnopolską. Gdy w przyszłości dodamy kolejne
 * miasta, ta flaga automatycznie stanie się `false`.
 */
export const isBeachheadMarket = SUPPORTED_CITIES.length === 1;

/**
 * Domyślne (jedyne) obsługiwane miasto w trybie beachhead, lub `null` gdy
 * aplikacja wspiera wiele miast. Komponent sprawdza po prostu `if (DEFAULT_CITY)`.
 */
export const DEFAULT_CITY: string | null =
  SUPPORTED_CITIES.length === 1 ? SUPPORTED_CITIES[0] : null;
