/**
 * User utility functions for formatting user data
 */

interface User {
  firstName?: string | null;
  lastName?: string | null;
  username?: string;
}

/**
 * Gets the full name of a user or falls back to username
 * @param user - User object with firstName, lastName, and username
 * @param fallback - Optional fallback string if no name is available
 * @returns Formatted full name or fallback
 */
export function getFullName(
  user?: User | null,
  fallback: string = "User",
): string {
  if (!user) return fallback;

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  return user.username || fallback;
}

/**
 * Gets the initials from a user's name
 * @param user - User object with firstName and lastName
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export function getInitials(user?: User | null): string {
  if (!user) return "";

  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }

  return "";
}

/**
 * Constructs a full photo URL from a path or returns the URL as-is if it's already absolute
 * @param photoPath - Photo path or URL
 * @returns Full photo URL or null
 */
export function getPhotoUrl(photoPath?: string | null): string | null {
  if (!photoPath) return null;

  // If it's already an absolute URL, return as-is
  if (photoPath.startsWith("http")) {
    return photoPath;
  }

  // Otherwise, prepend the API URL
  return `${process.env.NEXT_PUBLIC_API_URL}${photoPath}`;
}

/**
 * Gets the instructor name from a booking's instructorUser object
 * Falls back to email or "Instructor" if no name is available
 */
export function getInstructorName(booking: {
  instructorUser?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
}): string {
  return booking.instructorUser?.firstName
    ? `${booking.instructorUser.firstName} ${booking.instructorUser.lastName || ""}`.trim()
    : booking.instructorUser?.email || "Instructor";
}
