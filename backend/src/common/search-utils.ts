export function buildInstructorSearchOrClause(
  q?: string,
): Record<string, any>[] | undefined {
  if (!q || !q.trim()) return undefined;

  const words = q.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return [
      {
        AND: words.map((word) => ({
          OR: [
            {
              user: {
                firstName: { contains: word, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                lastName: { contains: word, mode: 'insensitive' as const },
              },
            },
          ],
        })),
      },
      { user: { username: { contains: q, mode: 'insensitive' as const } } },
      { bio: { contains: q, mode: 'insensitive' as const } },
      { tagline: { contains: q, mode: 'insensitive' as const } },
      { tags: { has: q } },
      { specializations: { has: q } },
      { city: { contains: q, mode: 'insensitive' as const } },
    ];
  }

  // Single word
  return [
    { user: { firstName: { contains: q, mode: 'insensitive' as const } } },
    { user: { lastName: { contains: q, mode: 'insensitive' as const } } },
    { user: { username: { contains: q, mode: 'insensitive' as const } } },
    { bio: { contains: q, mode: 'insensitive' as const } },
    { tagline: { contains: q, mode: 'insensitive' as const } },
    { tags: { has: q } },
    { specializations: { has: q } },
    { city: { contains: q, mode: 'insensitive' as const } },
  ];
}
