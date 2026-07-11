import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  console.log('Seeding enterprise data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create enterprise user 1 - Studio Tańca Feniks (Białystok)
  const user1 = await prisma.user.upsert({
    where: { email: 'feniks@example.com' },
    update: {},
    create: {
      email: 'feniks@example.com',
      password: passwordHash,
      username: 'studio-feniks',
      firstName: 'Studio Tańca',
      lastName: 'Feniks',
      role: 'ENTERPRISE',
      isEmailVerified: true,
    },
  });

  await prisma.enterpriseProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      companyName: 'Studio Tańca Feniks',
      slug: 'studio-tanca-feniks',
      shortDescription:
        'Profesjonalna szkoła tańca towarzyskiego i nowoczesnego w Białymstoku',
      description:
        'Studio Tańca Feniks to miejsce, gdzie pasja spotyka się z profesjonalizmem. Oferujemy zajęcia z tańca towarzyskiego, nowoczesnego, hip-hopu oraz tańca współczesnego dla dzieci, młodzieży i dorosłych. Nasi instruktorzy to wykwalifikowani tancerze z wieloletnim doświadczeniem scenicznym i pedagogicznym.',
      email: 'kontakt@studiofeniks.pl',
      phone: '+48 600 700 800',
      website: 'https://studiofeniks.pl',
      city: 'Białystok',
      address: 'ul. Lipowa 15',
      postalCode: '15-424',
      category: 'DANCE_SCHOOL',
      status: 'ACTIVE',
      verified: true,
      tags: [
        'taniec towarzyski',
        'hip-hop',
        'taniec nowoczesny',
        'dzieci',
        'dorośli',
      ],
      amenities: ['parking', 'szatnia', 'klimatyzacja', 'lustra'],
      gallery: [],
      videos: [],
      partners: [],
      certificates: [],
      instagramUrl: 'https://instagram.com/studiofeniks',
      facebookUrl: 'https://facebook.com/studiofeniks',
      youtubeUrl: 'https://youtube.com/@studiofeniks',
    },
  });

  // Create enterprise user 2 - Fitness Klub Atlas (Warszawa)
  const user2 = await prisma.user.upsert({
    where: { email: 'atlas@example.com' },
    update: {},
    create: {
      email: 'atlas@example.com',
      password: passwordHash,
      username: 'fitness-atlas',
      firstName: 'Fitness Klub',
      lastName: 'Atlas',
      role: 'ENTERPRISE',
      isEmailVerified: true,
    },
  });

  await prisma.enterpriseProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      companyName: 'Fitness Klub Atlas',
      slug: 'fitness-klub-atlas',
      shortDescription:
        'Nowoczesny klub fitness z siłownią, zajęciami grupowymi i strefą relaksu',
      description:
        'Fitness Klub Atlas to jeden z największych klubów fitness w Warszawie. Oferujemy nowocześnie wyposażoną siłownię, ponad 50 różnych zajęć grupowych tygodniowo, strefę cardio, saunę oraz profesjonalne poradnictwo trenerskie.',
      email: 'info@fitnessatlas.pl',
      phone: '+48 22 123 45 67',
      website: 'https://fitnessatlas.pl',
      city: 'Warszawa',
      address: 'ul. Marszałkowska 100',
      postalCode: '00-001',
      category: 'FITNESS_CLUB',
      status: 'ACTIVE',
      verified: true,
      tags: ['siłownia', 'fitness', 'zajęcia grupowe', 'cardio', 'sauna'],
      amenities: [
        'parking',
        'szatnia',
        'prysznice',
        'sauna',
        'ręczniki',
        'woda',
      ],
      gallery: [],
      videos: [],
      partners: [],
      certificates: [],
      instagramUrl: 'https://instagram.com/fitnessatlas',
      facebookUrl: 'https://facebook.com/fitnessatlas',
    },
  });

  // Create enterprise user 3 - Joga Harmonia (Kraków)
  const user3 = await prisma.user.upsert({
    where: { email: 'harmonia@example.com' },
    update: {},
    create: {
      email: 'harmonia@example.com',
      password: passwordHash,
      username: 'joga-harmonia',
      firstName: 'Joga',
      lastName: 'Harmonia',
      role: 'ENTERPRISE',
      isEmailVerified: true,
    },
  });

  await prisma.enterpriseProfile.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      companyName: 'Joga Harmonia',
      slug: 'joga-harmonia',
      shortDescription:
        'Studio jogi w sercu Krakowa — znajdź równowagę ciała i umysłu',
      description:
        'Joga Harmonia to kameralne studio jogi oferujące zajęcia dla osób na każdym poziomie zaawansowania. Specjalizujemy się w hatha jodze, vinyasa, yin jodze oraz medytacji. Nasi instruktorzy to certyfikowani nauczyciele z międzynarodowymi kwalifikacjami.',
      email: 'hello@jogaharmonia.pl',
      phone: '+48 12 345 67 89',
      website: 'https://jogaharmonia.pl',
      city: 'Kraków',
      address: 'ul. Floriańska 25',
      postalCode: '31-019',
      category: 'YOGA_STUDIO',
      status: 'ACTIVE',
      verified: true,
      tags: ['joga', 'medytacja', 'mindfulness', 'hatha', 'vinyasa'],
      amenities: ['maty', 'poduszki', 'herbata', 'szatnia'],
      gallery: [],
      videos: [],
      partners: [],
      certificates: [],
      instagramUrl: 'https://instagram.com/jogaharmonia',
    },
  });

  // Create enterprise user 4 - CrossFit Białystok
  const user4 = await prisma.user.upsert({
    where: { email: 'crossfit@example.com' },
    update: {},
    create: {
      email: 'crossfit@example.com',
      password: passwordHash,
      username: 'crossfit-bialystok',
      firstName: 'CrossFit',
      lastName: 'Białystok',
      role: 'ENTERPRISE',
      isEmailVerified: true,
    },
  });

  await prisma.enterpriseProfile.upsert({
    where: { userId: user4.id },
    update: {},
    create: {
      userId: user4.id,
      companyName: 'CrossFit Białystok',
      slug: 'crossfit-bialystok',
      shortDescription:
        'Najlepszy box crossfitowy na Podlasiu — treningi funkcjonalne dla każdego',
      description:
        'CrossFit Białystok to profesjonalnie wyposażony box crossfitowy z certyfikowanymi trenerami. Oferujemy zajęcia crossfit, treningi funkcjonalne, olympic lifting oraz programy otwarte 24/7 dla naszych członków.',
      email: 'bialystok@crossfit.pl',
      phone: '+48 600 100 200',
      website: 'https://crossfitbialystok.pl',
      city: 'Białystok',
      address: 'ul. Produkcyjna 10',
      postalCode: '15-001',
      category: 'GYM',
      status: 'ACTIVE',
      verified: true,
      tags: ['crossfit', 'trening funkcjonalny', 'siłownia', 'wodowanie'],
      amenities: ['parking', 'prysznice', 'sprzęt Rogue', 'woda', 'ręczniki'],
      gallery: [],
      videos: [],
      partners: [],
      certificates: [],
      instagramUrl: 'https://instagram.com/crossfitbialystok',
      facebookUrl: 'https://facebook.com/crossfitbialystok',
    },
  });

  // Create enterprise user 5 - Szkoła Pływania Delfin (Gdańsk)
  const user5 = await prisma.user.upsert({
    where: { email: 'delfin@example.com' },
    update: {},
    create: {
      email: 'delfin@example.com',
      password: passwordHash,
      username: 'szkola-delfin',
      firstName: 'Szkoła Pływania',
      lastName: 'Delfin',
      role: 'ENTERPRISE',
      isEmailVerified: true,
    },
  });

  await prisma.enterpriseProfile.upsert({
    where: { userId: user5.id },
    update: {},
    create: {
      userId: user5.id,
      companyName: 'Szkoła Pływania Delfin',
      slug: 'szkola-plywania-delfin',
      shortDescription:
        'Nauka pływania dla dzieci i dorosłych — Gdańsk, Gdynia, Sopot',
      description:
        'Szkoła Pływania Delfin działa na terenie Trójmiasta od 10 lat. Uczymy pływania od podstaw, doskonalimy technikę, przygotowujemy do zawodów. Prowadzimy zajęcia indywidualne i grupowe na basenach w Gdańsku, Gdyni i Sopocie.',
      email: 'kontakt@szkoladelfin.pl',
      phone: '+48 58 300 40 50',
      website: 'https://szkoladelfin.pl',
      city: 'Gdańsk',
      address: 'ul. Chłopska 5',
      postalCode: '80-001',
      category: 'SWIMMING_POOL',
      status: 'ACTIVE',
      verified: true,
      tags: ['pływanie', 'nauka pływania', 'dzieci', 'dorośli', 'korekta'],
      amenities: ['basen', 'szatnia', 'parking', 'sprzęt do pływania'],
      gallery: [],
      videos: [],
      partners: [],
      certificates: [],
      facebookUrl: 'https://facebook.com/szkoladelfin',
    },
  });

  console.log('Seed completed successfully!');
  console.log('Created 5 enterprise profiles:');
  console.log('  1. Studio Tańca Feniks (Białystok)');
  console.log('  2. Fitness Klub Atlas (Warszawa)');
  console.log('  3. Joga Harmonia (Kraków)');
  console.log('  4. CrossFit Białystok (Białystok)');
  console.log('  5. Szkoła Pływania Delfin (Gdańsk)');
  console.log('');
  console.log('You can log in as any enterprise user with:');
  console.log(
    '  Email: feniks@example.com (or atlas, harmonia, crossfit, delfin)',
  );
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
