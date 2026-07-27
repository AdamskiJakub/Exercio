/**
 * Shared sort order utilities for instructor and enterprise profiles.
 * Maps frontend sortBy values to Prisma orderBy objects.
 */

export function getInstructorOrderBy(sortBy?: string): any {
  switch (sortBy) {
    case 'price-asc':
      return { sessionPrice: 'asc' };
    case 'price-desc':
      return { sessionPrice: 'desc' };
    case 'rating':
      // Handled in-memory in searchInstructorsRaw / searchInstructors
      return { createdAt: 'desc' };
    case 'most-reviewed':
      // Handled in-memory in searchInstructorsRaw / searchInstructors
      return { createdAt: 'desc' };
    case 'newest':
      return { createdAt: 'desc' };
    case 'name-asc':
      return { user: { firstName: 'asc' } };
    case 'name-desc':
      return { user: { firstName: 'desc' } };
    default:
      return { createdAt: 'desc' };
  }
}

export function getEnterpriseOrderBy(sortBy?: string): any {
  switch (sortBy) {
    case 'newest':
      return { createdAt: 'desc' };
    case 'name-asc':
      return { companyName: 'asc' };
    case 'name-desc':
      return { companyName: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}
