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
      // TODO: implement with review aggregation subquery
      return { createdAt: 'desc' };
    case 'most-reviewed':
      // TODO: implement with review count subquery
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
    case 'rating':
      // TODO: implement with review aggregation subquery
      return { createdAt: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}
