/**
 * Slugifies a name string into a valid username format.
 * Handles Polish diacritics and enforces backend constraints:
 * - 3-30 characters
 * - Only lowercase letters, numbers, and hyphens
 * - Must start and end with alphanumeric character
 */
function slugifyName(name: string): string {
  const diacriticsMap: Record<string, string> = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
  };

  let slug = name.toLowerCase().trim();

  // Replace Polish diacritics first
  for (const [char, replacement] of Object.entries(diacriticsMap)) {
    slug = slug.replace(new RegExp(char, "g"), replacement);
  }

  // Replace non-alphanumeric characters with hyphens
  slug = slug.replace(/[^a-z0-9]/g, "-");

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  // Remove consecutive hyphens
  slug = slug.replace(/-{2,}/g, "-");

  return slug;
}

/**
 * Generates a valid username from a person's name (firstName + lastName).
 * Falls back to email if name is not available.
 * Enforces backend constraints:
 * - 3-30 characters
 * - Only lowercase letters, numbers, and hyphens
 * - Must start and end with alphanumeric character
 *
 * @param firstName - User's first name (optional)
 * @param lastName - User's last name (optional)
 * @param email - User's email address (fallback)
 * @returns Generated username that complies with backend validation
 */
export function generateUsername(
  firstName?: string,
  lastName?: string,
  email?: string,
): string {
  // Prefer firstName + lastName
  const nameParts = [firstName, lastName].filter(Boolean);
  if (nameParts.length > 0) {
    const username = slugifyName(nameParts.join(" "));

    // If valid after slugification, return it
    if (username.length >= 3) {
      return username.substring(0, 30).replace(/-+$/, "");
    }
  }

  // Fallback to email if name didn't produce a valid username
  if (email) {
    return generateUsernameFromEmailFallback(email);
  }

  // Ultimate fallback
  const randomSuffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().substring(0, 6)
      : Math.random().toString(36).substring(2, 8);
  return `user-${randomSuffix}`;
}

/**
 * Fallback: generates a valid username from an email address.
 */
function generateUsernameFromEmailFallback(email: string): string {
  // Extract local part (before @)
  const localPart = email.split("@")[0].toLowerCase();

  // Replace non-alphanumeric characters with hyphens
  let username = localPart.replace(/[^a-z0-9]/g, "-");

  // Remove leading/trailing hyphens
  username = username.replace(/^-+|-+$/g, "");

  // Final cleanup: ensure no consecutive hyphens
  username = username.replace(/-{2,}/g, "-");

  // If username is too short after cleanup, pad with a suffix
  if (username.length < 3) {
    // Use first part of domain as fallback
    const domain = email.split("@")[1]?.split(".")[0] || "user";
    username = `${username}-${domain}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

    // Re-clean after appending domain
    username = username.replace(/^-+|-+$/g, "");
    username = username.replace(/-{2,}/g, "-");
  }

  // Ensure it still meets minimum length after all cleanup
  if (username.length < 3) {
    // Use crypto for better collision resistance
    const randomSuffix =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().substring(0, 6)
        : Math.random().toString(36).substring(2, 8);
    username = `user-${randomSuffix}`;
  }

  // Enforce max length (30 chars)
  if (username.length > 30) {
    username = username.substring(0, 30).replace(/-+$/, "");
  }

  return username;
}

/**
 * Validates if a username meets backend requirements.
 *
 * @param username - Username to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (username.length < 3 || username.length > 30) {
    return {
      isValid: false,
      error: "Username must be between 3 and 30 characters",
    };
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain lowercase letters, numbers, and hyphens",
    };
  }

  if (!/^[a-z0-9]/.test(username) || !/[a-z0-9]$/.test(username)) {
    return {
      isValid: false,
      error: "Username must start and end with a letter or number",
    };
  }

  return { isValid: true };
}
