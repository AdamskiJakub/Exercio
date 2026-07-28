import type { InstructorListing } from "@/types";
import type { Tag, Specialization, Goal } from "@/hooks/useConfig";

// ============= MOCK CONFIG DATA (mirrors backend/src/config/config.service.ts) =============

export const mockTags: Tag[] = [
  {
    id: "strength-training",
    key: "strength-training",
    names: { en: "Strength Training", pl: "Trening siłowy" },
    categoryIds: ["cat_personal_training"],
    enabled: true,
  },
  {
    id: "functional-training",
    key: "functional-training",
    names: { en: "Functional Training", pl: "Trening funkcjonalny" },
    categoryIds: ["cat_personal_training"],
    enabled: true,
  },
  {
    id: "hiit",
    key: "hiit",
    names: { en: "HIIT", pl: "HIIT" },
    categoryIds: ["cat_personal_training", "cat_fitness"],
    enabled: true,
  },
  {
    id: "calisthenics",
    key: "calisthenics",
    names: { en: "Calisthenics", pl: "Kalistenika" },
    categoryIds: ["cat_personal_training"],
    enabled: true,
  },
  {
    id: "mobility",
    key: "mobility",
    names: { en: "Mobility", pl: "Mobilność" },
    categoryIds: ["cat_personal_training", "cat_yoga", "cat_recovery"],
    enabled: true,
  },
  {
    id: "rehabilitation",
    key: "rehabilitation",
    names: { en: "Rehabilitation", pl: "Rehabilitacja" },
    categoryIds: ["cat_personal_training", "cat_recovery"],
    enabled: true,
  },
  {
    id: "beginner-friendly",
    key: "beginner-friendly",
    names: { en: "Beginner Friendly", pl: "Dla początkujących" },
    categoryIds: ["cat_personal_training"],
    enabled: true,
  },
  {
    id: "running",
    key: "running",
    names: { en: "Running", pl: "Bieganie" },
    categoryIds: ["cat_fitness"],
    enabled: true,
  },
  {
    id: "cycling",
    key: "cycling",
    names: { en: "Cycling", pl: "Kolarstwo" },
    categoryIds: ["cat_fitness"],
    enabled: true,
  },
  {
    id: "swimming",
    key: "swimming",
    names: { en: "Swimming", pl: "Pływanie" },
    categoryIds: ["cat_fitness"],
    enabled: true,
  },
  {
    id: "cardio-training",
    key: "cardio-training",
    names: { en: "Cardio Training", pl: "Trening cardio" },
    categoryIds: ["cat_fitness"],
    enabled: true,
  },
  {
    id: "hatha",
    key: "hatha",
    names: { en: "Hatha Yoga", pl: "Hatha Yoga" },
    categoryIds: ["cat_yoga"],
    enabled: true,
  },
  {
    id: "vinyasa",
    key: "vinyasa",
    names: { en: "Vinyasa", pl: "Vinyasa" },
    categoryIds: ["cat_yoga"],
    enabled: true,
  },
  {
    id: "yin-yoga",
    key: "yin-yoga",
    names: { en: "Yin Yoga", pl: "Yin Yoga" },
    categoryIds: ["cat_yoga"],
    enabled: true,
  },
  {
    id: "power-yoga",
    key: "power-yoga",
    names: { en: "Power Yoga", pl: "Power Yoga" },
    categoryIds: ["cat_yoga"],
    enabled: true,
  },
  {
    id: "pilates",
    key: "pilates",
    names: { en: "Pilates", pl: "Pilates" },
    categoryIds: ["cat_yoga"],
    enabled: true,
  },
  {
    id: "stretching",
    key: "stretching",
    names: { en: "Stretching", pl: "Stretching" },
    categoryIds: ["cat_yoga", "cat_recovery"],
    enabled: true,
  },
  {
    id: "social-dance",
    key: "social-dance",
    names: { en: "Social Dance", pl: "Taniec użytkowy" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "wedding-dance",
    key: "wedding-dance",
    names: { en: "Wedding Dance", pl: "Pierwszy taniec" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "hip-hop",
    key: "hip-hop",
    names: { en: "Hip-hop", pl: "Hip-hop" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "bachata",
    key: "bachata",
    names: { en: "Bachata", pl: "Bachata" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "salsa",
    key: "salsa",
    names: { en: "Salsa", pl: "Salsa" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "kizomba",
    key: "kizomba",
    names: { en: "Kizomba", pl: "Kizomba" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "reggaeton",
    key: "reggaeton",
    names: { en: "Reggaeton", pl: "Reggaeton" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "breakdance",
    key: "breakdance",
    names: { en: "Breakdance", pl: "Break dance" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "heels",
    key: "heels",
    names: { en: "High Heels", pl: "High Heels" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "pole-dance",
    key: "pole-dance",
    names: { en: "Pole Dance", pl: "Pole Dance" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "ballet",
    key: "ballet",
    names: { en: "Ballet", pl: "Balet" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "boxing",
    key: "boxing",
    names: { en: "Boxing", pl: "Boks" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "mma",
    key: "mma",
    names: { en: "MMA", pl: "MMA" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "muay-thai",
    key: "muay-thai",
    names: { en: "Muay Thai", pl: "Muay Thai" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "kickboxing",
    key: "kickboxing",
    names: { en: "Kickboxing", pl: "Kickboxing" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "bjj",
    key: "bjj",
    names: { en: "Brazilian Jiu-Jitsu", pl: "Brazylijskie Jiu-Jitsu" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "karate",
    key: "karate",
    names: { en: "Karate", pl: "Karate" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "judo",
    key: "judo",
    names: { en: "Judo", pl: "Judo" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "taekwondo",
    key: "taekwondo",
    names: { en: "Taekwondo", pl: "Taekwondo" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "krav-maga",
    key: "krav-maga",
    names: { en: "Krav Maga", pl: "Krav Maga" },
    categoryIds: ["cat_martial_arts"],
    enabled: true,
  },
  {
    id: "football",
    key: "football",
    names: { en: "Football", pl: "Piłka nożna" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "basketball",
    key: "basketball",
    names: { en: "Basketball", pl: "Koszykówka" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "volleyball",
    key: "volleyball",
    names: { en: "Volleyball", pl: "Siatkówka" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "handball",
    key: "handball",
    names: { en: "Handball", pl: "Piłka ręczna" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "athletic-training",
    key: "athletic-training",
    names: { en: "Athletic Training", pl: "Trening atletyczny" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "weight-loss-diet",
    key: "weight-loss-diet",
    names: { en: "Weight Loss Diet", pl: "Dieta redukcyjna" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "muscle-gain-diet",
    key: "muscle-gain-diet",
    names: { en: "Muscle Gain Diet", pl: "Dieta na masę" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "sports-nutrition",
    key: "sports-nutrition",
    names: { en: "Sports Nutrition", pl: "Dietetyka sportowa" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "meal-planning",
    key: "meal-planning",
    names: { en: "Meal Planning", pl: "Układanie planów żywieniowych" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "healthy-eating",
    key: "healthy-eating",
    names: { en: "Healthy Eating", pl: "Zdrowe odżywianie" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "supplementation",
    key: "supplementation",
    names: { en: "Supplementation", pl: "Suplementacja" },
    categoryIds: ["cat_nutrition"],
    enabled: true,
  },
  {
    id: "massage",
    key: "massage",
    names: { en: "Massage", pl: "Masaż" },
    categoryIds: ["cat_recovery"],
    enabled: true,
  },
  {
    id: "injury-recovery",
    key: "injury-recovery",
    names: { en: "Injury Recovery", pl: "Powrót po kontuzji" },
    categoryIds: ["cat_recovery"],
    enabled: true,
  },
  {
    id: "zumba",
    key: "zumba",
    names: { en: "Zumba", pl: "Zumba" },
    categoryIds: ["cat_fitness", "cat_dance"],
    enabled: true,
  },
  {
    id: "ems",
    key: "ems",
    names: { en: "EMS", pl: "EMS" },
    categoryIds: ["cat_personal_training", "cat_fitness"],
    enabled: true,
  },
  {
    id: "spinning",
    key: "spinning",
    names: { en: "Spinning", pl: "Spinning" },
    categoryIds: ["cat_fitness"],
    enabled: true,
  },
  {
    id: "contemporary-jazz",
    key: "contemporary-jazz",
    names: { en: "Contemporary/Jazz", pl: "Contemporary/Jazz" },
    categoryIds: ["cat_dance"],
    enabled: true,
  },
  {
    id: "squash",
    key: "squash",
    names: { en: "Squash", pl: "Squash" },
    categoryIds: ["cat_sports"],
    enabled: true,
  },
  {
    id: "osteopathy",
    key: "osteopathy",
    names: { en: "Osteopathy", pl: "Osteopatia" },
    categoryIds: ["cat_recovery", "cat_personal_training"],
    enabled: true,
  },
];

export const mockSpecializations: Specialization[] = [
  {
    id: "personal-training",
    nameEn: "Personal Training",
    namePl: "Trening personalny",
    icon: "💪",
    order: 1,
  },
  {
    id: "fitness-cardio",
    nameEn: "Fitness & Cardio",
    namePl: "Fitness & Cardio",
    icon: "🏃",
    order: 2,
  },
  {
    id: "yoga-mobility",
    nameEn: "Yoga & Mobility",
    namePl: "Joga & Mobilność",
    icon: "🧘",
    order: 3,
  },
  { id: "dance", nameEn: "Dance", namePl: "Taniec", icon: "🕺", order: 4 },
  {
    id: "martial-arts",
    nameEn: "Martial Arts",
    namePl: "Sztuki walki",
    icon: "🥊",
    order: 5,
  },
  { id: "sports", nameEn: "Sports", namePl: "Sporty", icon: "⚽", order: 6 },
  {
    id: "nutrition",
    nameEn: "Nutrition",
    namePl: "Dietetyka",
    icon: "🥗",
    order: 7,
  },
  {
    id: "recovery",
    nameEn: "Recovery",
    namePl: "Regeneracja",
    icon: "🩹",
    order: 8,
  },
];

export const mockGoals: Goal[] = [
  {
    id: "weight_loss",
    nameEn: "Weight Loss",
    namePl: "Redukcja wagi",
    icon: "🎯",
  },
  {
    id: "muscle_gain",
    nameEn: "Muscle Gain",
    namePl: "Budowa masy mięśniowej",
    icon: "💪",
  },
  { id: "endurance", nameEn: "Endurance", namePl: "Wytrzymałość", icon: "🏃" },
  {
    id: "flexibility",
    nameEn: "Flexibility",
    namePl: "Elastyczność",
    icon: "🧘",
  },
  { id: "strength", nameEn: "Strength", namePl: "Siła", icon: "💪" },
  {
    id: "health",
    nameEn: "General Health",
    namePl: "Ogólne zdrowie",
    icon: "❤️",
  },
  {
    id: "sport_performance",
    nameEn: "Sport Performance",
    namePl: "Wyniki sportowe",
    icon: "⚡",
  },
];

// ============= MOCK INSTRUCTORS =============

const cities = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Łódź",
  "Katowice",
  "Lublin",
  "Szczecin",
  "Bydgoszcz",
];

const firstNames = [
  "Anna",
  "Jan",
  "Katarzyna",
  "Michał",
  "Agnieszka",
  "Tomasz",
  "Marta",
  "Piotr",
  "Ewa",
  "Krzysztof",
  "Magdalena",
  "Łukasz",
  "Paulina",
  "Dawid",
  "Natalia",
  "Bartosz",
  "Aleksandra",
  "Marcin",
  "Joanna",
  "Rafał",
];

const lastNames = [
  "Kowalska",
  "Nowak",
  "Wiśniewska",
  "Zieliński",
  "Kamińska",
  "Lewandowski",
  "Wójcik",
  "Szymański",
  "Dąbrowska",
  "Kozłowski",
  "Jankowski",
  "Mazur",
  "Krawczyk",
  "Piotrowicz",
  "Grabowski",
  "Pawlak",
  "Michalski",
  "Wróbel",
  "Stępień",
  "Ostrowski",
];

const bioTemplates = [
  "Certyfikowany trener z {years}+ letnim doświadczeniem. Specjalizuję się w {specialization}. Pomogłem już ponad {clients} klientom osiągnąć ich cele.",
  "Trener personalny i pasjonat zdrowego stylu życia. Oferuję indywidualne podejście do każdego klienta. Moja specjalizacja to {specialization}.",
  "Z wykształcenia fizjoterapeuta, z pasji trener. Łączę wiedzę medyczną z treningiem personalnym. {years} lat doświadczenia.",
  "Międzynarodowy certyfikat trenerski. Specjalizacja: {specialization}. Wierzę w holistyczne podejście do treningu.",
  "Trener z {years}+ letnim stażem. Pomagam osiągać cele sportowe od podstaw po zaawansowany poziom. {clients}+ zadowolonych klientów.",
];

const taglines = [
  "Twój sukces to moja motywacja",
  "Razem osiągniemy więcej",
  "Trening szyty na miarę",
  "Profesjonalne podejście, najlepsze efekty",
  "Zmień swoje ciało, zmień swoje życie",
  "Ekspert w swojej dziedzinie",
  "Trening bez kompromisów",
  "Twoje cele, mój plan",
  "Sprawdzone metody, realne efekty",
  "Krok po kroku do wymarzonej sylwetki",
];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateMockInstructor(index: number): InstructorListing {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const spec = mockSpecializations[index % mockSpecializations.length];
  const specialization = spec.id;
  const yearsExp = 2 + (index % 15);
  const clients = 10 + index * 3;
  const city = cities[index % cities.length];
  const hourlyRate = 50 + (index % 15) * 10;
  const tags = pickRandomN(mockTags, 2 + (index % 4)).map((t) => t.id);
  const goals = pickRandomN(mockGoals, 2 + (index % 3)).map((g) => g.id);
  const bio = pickRandom(bioTemplates)
    .replace("{years}", String(yearsExp))
    .replace("{specialization}", spec.namePl.toLowerCase())
    .replace("{clients}", String(clients));

  return {
    id: `mock-${index + 1}`,
    userId: `mock-user-${index + 1}`,
    bio,
    tagline: taglines[index % taglines.length],
    specializations: [specialization],
    tags,
    goals,
    location: city,
    city,
    hourlyRate,
    hourlyRateHidden: false,
    packageDealsEnabled: Math.random() > 0.5,
    packageDealsDescription:
      Math.random() > 0.5 ? "Rabat przy zakupie pakietu 5 treningów" : null,
    photoUrl: null,
    gallery: [],
    verified: index % 3 !== 0,
    isDraft: false,
    yearsExperience: yearsExp,
    availability: (["online", "in-person", "both"] as const)[index % 3],
    languages: ["polski", ...(index % 2 === 0 ? ["angielski"] : [])],
    createdAt: new Date(2025, 0, 1 + index).toISOString(),
    updatedAt: new Date(2026, 5, 1 + index).toISOString(),
    username,
    fullName: `${firstName} ${lastName}`,
    primarySpecialization: specialization,
    videoUrl: null,
    averageRating:
      index % 5 === 0 ? undefined : 3 + (index % 3) + Math.random(),
    reviewCount: index % 5 === 0 ? undefined : 5 + index * 2,
    user: {
      id: `mock-user-${index + 1}`,
      username,
      firstName,
      lastName,
      role: "instructor",
    },
  };
}

const MOCK_INSTRUCTORS: InstructorListing[] = Array.from(
  { length: 30 },
  (_, i) => generateMockInstructor(i),
);

export interface MockPaginatedResult {
  data: InstructorListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getMockInstructors(params: {
  page?: number;
  limit?: number;
  city?: string;
  specialization?: string;
  tags?: string[];
  goals?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
}): MockPaginatedResult {
  const page = params.page || 1;
  const limit = params.limit || 20;

  let filtered = [...MOCK_INSTRUCTORS];

  if (params.city) {
    const cityLower = params.city.toLowerCase();
    filtered = filtered.filter((i) =>
      i.city?.toLowerCase().includes(cityLower),
    );
  }

  if (params.specialization) {
    const specLower = params.specialization.toLowerCase();
    filtered = filtered.filter((i) =>
      i.specializations.some((s) => s.toLowerCase().includes(specLower)),
    );
  }

  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter((i) =>
      params.tags!.some((tag) => i.tags.includes(tag)),
    );
  }

  if (params.goals && params.goals.length > 0) {
    filtered = filtered.filter((i) =>
      params.goals!.some((goal) => i.goals.includes(goal)),
    );
  }

  if (params.priceMin !== undefined) {
    filtered = filtered.filter(
      (i) => i.hourlyRate !== null && i.hourlyRate >= params.priceMin!,
    );
  }
  if (params.priceMax !== undefined) {
    filtered = filtered.filter(
      (i) => i.hourlyRate !== null && i.hourlyRate <= params.priceMax!,
    );
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.fullName.toLowerCase().includes(searchLower) ||
        i.bio?.toLowerCase().includes(searchLower) ||
        i.city?.toLowerCase().includes(searchLower) ||
        i.tagline?.toLowerCase().includes(searchLower),
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return { data, total, page, limit, totalPages };
}
