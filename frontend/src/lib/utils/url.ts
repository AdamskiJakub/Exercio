const FACEBOOK_DOMAINS = [
  "facebook.com",
  "www.facebook.com",
  "fb.com",
  "m.facebook.com",
  "instagram.com",
];

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function matchesDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith("." + domain);
}

export function isSocialMediaUrl(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;
  return FACEBOOK_DOMAINS.some((domain) => matchesDomain(hostname, domain));
}

export function isInstagramUrl(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;
  return matchesDomain(hostname, "instagram.com");
}
