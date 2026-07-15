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

async function generateUniqueUsername(
  baseUsername: string,
  excludeId: string,
): Promise<string> {
  let username = baseUsername;
  let counter = 1;

  while (
    await prisma.user.findFirst({
      where: { username, id: { not: excludeId } },
    })
  ) {
    username = `${baseUsername}-${counter}`;
    counter++;
  }

  return username;
}

async function main() {
  console.log('Starting instructor username migration...');

  const instructors = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${instructors.length} instructor users to process.`);

  let updated = 0;
  let errors = 0;

  for (const user of instructors) {
    try {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';

      if (!firstName && !lastName) {
        console.warn(
          `  ⚠ Skipping user ${user.id} (${user.email}): no firstName or lastName`,
        );
        continue;
      }

      const baseUsername = slugifyToAscii(`${firstName} ${lastName}`);

      if (!baseUsername) {
        console.warn(
          `  ⚠ Skipping user ${user.id} (${user.email}): "${firstName} ${lastName}" produced empty username`,
        );
        continue;
      }

      const newUsername = await generateUniqueUsername(baseUsername, user.id);

      if (newUsername !== user.username) {
        await prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername },
        });
        console.log(
          `  ✓ ${firstName} ${lastName}: "${user.username}" → "${newUsername}"`,
        );
        updated++;
      } else {
        console.log(
          `  - ${firstName} ${lastName}: username "${user.username}" unchanged`,
        );
      }
    } catch (error) {
      console.error(
        `  ✗ Error processing user ${user.id} (${user.email}):`,
        error,
      );
      errors++;
    }
  }

  console.log(`\nMigration complete.`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${instructors.length}`);
}

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
