import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

function slugifyToAscii(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-|-$/g, '');
}

async function generateUniqueSlug(
  baseSlug: string,
  excludeId: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.enterpriseProfile.findFirst({
      where: { slug, id: { not: excludeId } },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function main() {
  console.log('Starting enterprise slug migration...');

  const enterprises = await prisma.enterpriseProfile.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${enterprises.length} enterprise profiles to process.`);

  let updated = 0;
  let errors = 0;

  for (const enterprise of enterprises) {
    try {
      const baseSlug = slugifyToAscii(enterprise.companyName);

      if (!baseSlug) {
        console.warn(
          `  ⚠ Skipping enterprise ${enterprise.id}: companyName "${enterprise.companyName}" produced empty slug`,
        );
        continue;
      }

      const newSlug = await generateUniqueSlug(baseSlug, enterprise.id);

      if (newSlug !== enterprise.slug) {
        await prisma.enterpriseProfile.update({
          where: { id: enterprise.id },
          data: { slug: newSlug },
        });
        console.log(
          `  ✓ ${enterprise.companyName}: "${enterprise.slug}" → "${newSlug}"`,
        );
        updated++;
      } else {
        console.log(
          `  - ${enterprise.companyName}: slug "${enterprise.slug}" unchanged`,
        );
      }
    } catch (error) {
      console.error(
        `  ✗ Error processing enterprise ${enterprise.id} (${enterprise.companyName}):`,
        error,
      );
      errors++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${enterprises.length}`);
}

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
