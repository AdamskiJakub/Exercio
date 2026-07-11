"use client";

export type CookieCategory =
  | "necessary"
  | "functional"
  | "analytics"
  | "marketing";

export interface CookieConsent {
  accepted: boolean;
  categories: Record<CookieCategory, boolean>;
  timestamp: string;
  version: number;
}

const CONSENT_KEY = "exercio_cookie_consent";
const CONSENT_VERSION = 1;

const CONSENT_COOKIE_FLAG = "exercio_consent";

const DEFAULT_CONSENT: CookieConsent = {
  accepted: false,
  categories: {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  },
  timestamp: "",
  version: CONSENT_VERSION,
};

function getConsentCookieFlag(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${CONSENT_COOKIE_FLAG}=1`));
}

function setConsentCookieFlag(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_FLAG}=1; path=/; SameSite=Lax; Secure`;
}

function clearConsentCookieFlag(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_FLAG}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
}

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;

  if (!getConsentCookieFlag()) {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_CONSENT;
  }

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return DEFAULT_CONSENT;

    const parsed = JSON.parse(stored) as CookieConsent;

    if (parsed.version !== CONSENT_VERSION) {
      return DEFAULT_CONSENT;
    }

    return parsed;
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveCookieConsent(
  accepted: boolean,
  categories?: Partial<Record<CookieCategory, boolean>>,
): void {
  if (typeof window === "undefined") return;

  const consent: CookieConsent = {
    accepted,
    categories: {
      ...DEFAULT_CONSENT.categories,
      ...categories,
      necessary: true,
    },
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setConsentCookieFlag();
  } catch (error) {
    console.error("Failed to save cookie consent:", error);
  }
}

export function hasCookieConsent(): boolean {
  const consent = getCookieConsent();
  return consent.accepted;
}

export function isCategoryAllowed(category: CookieCategory): boolean {
  const consent = getCookieConsent();
  return consent.categories[category] ?? false;
}

export function clearCookieConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_KEY);
    clearConsentCookieFlag();
  } catch (error) {
    console.error("Failed to clear cookie consent:", error);
  }
}
