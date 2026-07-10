import {
  Star,
  Users,
  Heart,
  Award,
  Zap,
  TrendingUp,
  Shield,
  Music,
  Dumbbell,
  Smile,
  Target,
  CheckCircle2,
  ParkingCircle,
  ShowerHead,
  DoorOpen,
  Thermometer,
  Accessibility,
  Gift,
  type LucideIcon,
} from "lucide-react";

/**
 * Days of the week used for opening hours display.
 */
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/**
 * Section IDs used for anchor navigation on the public profile.
 */
export const SECTION_IDS = {
  about: "about",
  whyUs: "why-us",
  offer: "offer",
  pricing: "pricing",
  gallery: "gallery",
  instructors: "instructors",
  news: "news",
} as const;

/**
 * Amenity items with their corresponding icons and profile field keys.
 */
export const AMENITY_ITEMS = [
  { key: "hasParking", icon: ParkingCircle },
  { key: "hasShower", icon: ShowerHead },
  { key: "hasLockerRoom", icon: DoorOpen },
  { key: "hasAirConditioning", icon: Thermometer },
  { key: "hasDisabledAccess", icon: Accessibility },
  { key: "hasFreeTrial", icon: Gift },
] as const;

/**
 * Known preset values for i18n resolution.
 * Used by resolvePreset() to avoid MISSING_MESSAGE errors for custom values.
 */
export const KNOWN_PRESETS = {
  targetAudiencePresets: new Set([
    "children",
    "teenagers",
    "adults",
    "seniors",
    "beginners",
    "intermediate",
    "advanced",
    "professional",
  ]),
  disciplinesPresets: new Set([
    "strengthTraining",
    "cardio",
    "yoga",
    "pilates",
    "dance",
    "martialArts",
    "swimming",
    "crossfit",
    "calisthenics",
    "rehabilitation",
    "sportsMassage",
    "nutritionCoaching",
    "boxing",
    "zumba",
    "spinning",
    "functionalTraining",
  ]),
  languagesPresets: new Set([
    "polish",
    "english",
    "german",
    "french",
    "spanish",
    "italian",
    "russian",
    "ukrainian",
    "chinese",
    "japanese",
  ]),
} as const;

/**
 * Resolves a preset value with i18n fallback.
 * Only attempts translation for known preset keys.
 * Custom user-entered values are returned as-is.
 */
export function resolvePreset(
  value: string,
  namespace: string,
  tp: (key: string) => string,
): string {
  const presets = KNOWN_PRESETS[namespace as keyof typeof KNOWN_PRESETS];
  if (presets && presets.has(value)) {
    return tp(`${namespace}.${value}`);
  }
  return value;
}

/**
 * Keyword-based icon mapping for highlight labels.
 * Matches common Polish/English keywords to appropriate icons.
 */
export function getHighlightIcon(label: string): LucideIcon {
  const lower = label.toLowerCase();

  if (
    lower.includes("doświadcz") ||
    lower.includes("experience") ||
    lower.includes("lat") ||
    lower.includes("staż")
  )
    return Star;
  if (
    lower.includes("instruktor") ||
    lower.includes("trener") ||
    lower.includes("coach") ||
    lower.includes("kadra")
  )
    return Users;
  if (
    lower.includes("klient") ||
    lower.includes("zadowolon") ||
    lower.includes("uczestnik") ||
    lower.includes("member") ||
    lower.includes("community") ||
    lower.includes("społecz")
  )
    return Heart;
  if (
    lower.includes("nagrod") ||
    lower.includes("wyróżnien") ||
    lower.includes("osiągni") ||
    lower.includes("achievement") ||
    lower.includes("certyfikat")
  )
    return Award;
  if (
    lower.includes("nowoczes") ||
    lower.includes("sprzęt") ||
    lower.includes("facility") ||
    lower.includes("obiekt") ||
    lower.includes("technologi")
  )
    return Zap;
  if (
    lower.includes("rozwój") ||
    lower.includes("postęp") ||
    lower.includes("progress") ||
    lower.includes("wzrost") ||
    lower.includes("development")
  )
    return TrendingUp;
  if (
    lower.includes("bezpiecz") ||
    lower.includes("safe") ||
    lower.includes("ochron") ||
    lower.includes("higien")
  )
    return Shield;
  if (
    lower.includes("muzy") ||
    lower.includes("music") ||
    lower.includes("taniec") ||
    lower.includes("dance")
  )
    return Music;
  if (
    lower.includes("sport") ||
    lower.includes("fitness") ||
    lower.includes("siłown") ||
    lower.includes("gym")
  )
    return Dumbbell;
  if (
    lower.includes("atmosfer") ||
    lower.includes("przyjaz") ||
    lower.includes("friendly") ||
    lower.includes("mile") ||
    lower.includes("życzliw")
  )
    return Smile;
  if (
    lower.includes("cel") ||
    lower.includes("target") ||
    lower.includes("wynik") ||
    lower.includes("misj")
  )
    return Target;

  return CheckCircle2;
}

/**
 * Social platform configuration for sidebar icons.
 */
export const SOCIAL_PLATFORMS = [
  {
    key: "facebookUrl" as const,
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    key: "instagramUrl" as const,
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    key: "youtubeUrl" as const,
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    key: "tiktokUrl" as const,
    label: "TikTok",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
] as const;
