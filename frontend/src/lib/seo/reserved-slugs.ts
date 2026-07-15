/**
 * Reserved slugs that cannot be used as usernames, enterprise slugs,
 * or city slugs to prevent route conflicts.
 *
 * Next.js App Router prioritizes static routes over dynamic [param] routes,
 * but we must prevent users from creating profiles with slugs that would
 * shadow SEO landing pages (e.g., username "warszawa" would conflict with
 * the /[city] route).
 *
 * City names are sourced from the `polish-cities` package to ensure
 * comprehensive coverage without manual maintenance.
 */

import rawCitiesData from "polish-cities/data/city.json";
import type { RawCity } from "@/hooks/useCityAutocomplete";

/**
 * Static routes that exist in the app — these must always be reserved.
 */
const STATIC_ROUTES = [
  // Auth & account
  "login",
  "logowanie",
  "register",
  "rejestracja",
  "forgot-password",
  "zapomnialem-hasla",
  "reset-password",
  "resetowanie-hasla",
  "verify-email",
  "weryfikacja-email",
  "activate",
  "aktywuj",

  // Dashboard
  "dashboard",
  "panel",
  "settings",
  "ustawienia",
  "profile",
  "profil",
  "edit",
  "edycja",
  "preview",
  "podglad",
  "calendar",
  "kalendarz",

  // Instructors & enterprise
  "instructors",
  "instruktorzy",
  "instructor",
  "instruktor",
  "enterprise",
  "firma",
  "apply",
  "aplikuj",

  // Static pages
  "help",
  "pomoc",
  "contact",
  "kontakt",
  "safety",
  "bezpieczenstwo",
  "privacy",
  "polityka-prywatnosci",
  "terms",
  "regulamin",
  "cookies",
  "polityka-cookies",
  "refund",
  "zwroty",
  "dpa",
  "umowa-powierzenia-danych",
  "acceptable-use",
  "zasady-korzystania",
  "enterprise-terms",
  "regulamin-enterprise",
  "review",
  "opinia",
  "partner",
  "dla-firm",
  "onboarding",
  "blog",
  "sitemap",
  "robots",

  // API & system
  "api",
  "auth",
  "_next",
  "_vercel",
  "admin",
  "health",
  "status",

  // SEO route group prefixes
  "s",
  "seo",
  "discipline",
  "dyscyplina",
  "city",
  "miasto",
  "category",
  "kategoria",
];

/**
 * Build the full set of reserved slugs from static routes + all Polish city names.
 */
function buildReservedSlugs(): Set<string> {
  const slugs = new Set<string>(STATIC_ROUTES);

  // Add all city names from the polish-cities package
  const data = rawCitiesData as unknown as { city: RawCity[] };
  if (data?.city) {
    for (const city of data.city) {
      const normalized = city.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-ząćęłńóśźż0-9-]/g, "");
      if (normalized) {
        slugs.add(normalized);
      }
    }
  }

  // Add category slugs from the catalog to prevent conflicts
  // Categories are used as SEO landing pages at /[locale]/{category-slug}
  const categorySlugs = [
    "taniec",
    "dance",
    "trening-personalny",
    "personal-training",
    "joga",
    "yoga",
    "sztuki-walki",
    "martial-arts",
    "fitness-i-cardio",
    "fitness-and-cardio",
    "sporty-druzynowe",
    "team-sports",
    "taniec-dla-par",
    "dance-for-couples",
    "taniec-dla-dzieci",
    "dance-for-kids",
  ];
  for (const slug of categorySlugs) {
    slugs.add(slug);
  }

  return slugs;
}

let _resolved: Set<string> | null = null;

function getResolvedSlugs(): Set<string> {
  if (!_resolved) {
    _resolved = buildReservedSlugs();
  }
  return _resolved;
}

/**
 * Check if a slug is reserved and cannot be used as a username,
 * enterprise slug, or city slug.
 */
export function isReservedSlug(slug: string): boolean {
  return getResolvedSlugs().has(slug.toLowerCase().trim());
}

/**
 * Get the list of reserved slugs as an array (for API responses, etc.)
 */
export function getReservedSlugs(): string[] {
  return Array.from(getResolvedSlugs()).sort();
}
