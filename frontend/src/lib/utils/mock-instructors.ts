import type { InstructorListing } from "@/types";
import type { Tag, Specialization, Goal } from "@/hooks/useConfig";

// ============= MOCK CONFIG DATA (mirrors backend/src/config/config.service.ts) =============

export const mockTags: Tag[] = [
  {
    id: "strength-training",
    nameEn: "Strength Training",
    namePl: "Trening siłowy",
    categories: ["personal-training"],
  },
  {
    id: "functional-training",
    nameEn: "Functional Training",
    namePl: "Trening funkcjonalny",
    categories: ["personal-training"],
  },
  {
    id: "hiit",
    nameEn: "HIIT",
    namePl: "HIIT",
    categories: ["personal-training", "fitness-cardio"],
  },
  {
    id: "calisthenics",
    nameEn: "Calisthenics",
    namePl: "Kalistenika",
    categories: ["personal-training"],
  },
  {
    id: "mobility",
    nameEn: "Mobility",
    namePl: "Mobilność",
    categories: ["personal-training", "yoga-mobility", "recovery"],
  },
  {
    id: "rehabilitation",
    nameEn: "Rehabilitation",
    namePl: "Rehabilitacja",
    categories: ["personal-training", "recovery"],
  },
  {
    id: "beginner-friendly",
    nameEn: "Beginner Friendly",
    namePl: "Dla początkujących",
    categories: ["personal-training"],
  },
  {
    id: "running",
    nameEn: "Running",
    namePl: "Bieganie",
    categories: ["fitness-cardio"],
  },
  {
    id: "cycling",
    nameEn: "Cycling",
    namePl: "Kolarstwo",
    categories: ["fitness-cardio"],
  },
  {
    id: "swimming",
    nameEn: "Swimming",
    namePl: "Pływanie",
    categories: ["fitness-cardio"],
  },
  {
    id: "cardio-training",
    nameEn: "Cardio Training",
    namePl: "Trening cardio",
    categories: ["fitness-cardio"],
  },
  {
    id: "hatha",
    nameEn: "Hatha Yoga",
    namePl: "Hatha Yoga",
    categories: ["yoga-mobility"],
  },
  {
    id: "vinyasa",
    nameEn: "Vinyasa",
    namePl: "Vinyasa",
    categories: ["yoga-mobility"],
  },
  {
    id: "yin-yoga",
    nameEn: "Yin Yoga",
    namePl: "Yin Yoga",
    categories: ["yoga-mobility"],
  },
  {
    id: "power-yoga",
    nameEn: "Power Yoga",
    namePl: "Power Yoga",
    categories: ["yoga-mobility"],
  },
  {
    id: "pilates",
    nameEn: "Pilates",
    namePl: "Pilates",
    categories: ["yoga-mobility"],
  },
  {
    id: "stretching",
    nameEn: "Stretching",
    namePl: "Stretching",
    categories: ["yoga-mobility", "recovery"],
  },
  {
    id: "social-dance",
    nameEn: "Social Dance",
    namePl: "Taniec użytkowy",
    categories: ["dance"],
  },
  {
    id: "wedding-dance",
    nameEn: "Wedding Dance",
    namePl: "Pierwszy taniec",
    categories: ["dance"],
  },
  {
    id: "hip-hop",
    nameEn: "Hip-hop",
    namePl: "Hip-hop",
    categories: ["dance"],
  },
  {
    id: "bachata",
    nameEn: "Bachata",
    namePl: "Bachata",
    categories: ["dance"],
  },
  { id: "salsa", nameEn: "Salsa", namePl: "Salsa", categories: ["dance"] },
  {
    id: "kizomba",
    nameEn: "Kizomba",
    namePl: "Kizomba",
    categories: ["dance"],
  },
  {
    id: "reggaeton",
    nameEn: "Reggaeton",
    namePl: "Reggaeton",
    categories: ["dance"],
  },
  {
    id: "breakdance",
    nameEn: "Breakdance",
    namePl: "Break dance",
    categories: ["dance"],
  },
  {
    id: "heels",
    nameEn: "High Heels",
    namePl: "High Heels",
    categories: ["dance"],
  },
  {
    id: "pole-dance",
    nameEn: "Pole Dance",
    namePl: "Pole Dance",
    categories: ["dance"],
  },
  { id: "ballet", nameEn: "Ballet", namePl: "Balet", categories: ["dance"] },
  {
    id: "boxing",
    nameEn: "Boxing",
    namePl: "Boks",
    categories: ["martial-arts"],
  },
  { id: "mma", nameEn: "MMA", namePl: "MMA", categories: ["martial-arts"] },
  {
    id: "muay-thai",
    nameEn: "Muay Thai",
    namePl: "Muay Thai",
    categories: ["martial-arts"],
  },
  {
    id: "kickboxing",
    nameEn: "Kickboxing",
    namePl: "Kickboxing",
    categories: ["martial-arts"],
  },
  {
    id: "bjj",
    nameEn: "Brazilian Jiu-Jitsu",
    namePl: "Brazylijskie Jiu-Jitsu",
    categories: ["martial-arts"],
  },
  {
    id: "karate",
    nameEn: "Karate",
    namePl: "Karate",
    categories: ["martial-arts"],
  },
  { id: "judo", nameEn: "Judo", namePl: "Judo", categories: ["martial-arts"] },
  {
    id: "taekwondo",
    nameEn: "Taekwondo",
    namePl: "Taekwondo",
    categories: ["martial-arts"],
  },
  {
    id: "krav-maga",
    nameEn: "Krav Maga",
    namePl: "Krav Maga",
    categories: ["martial-arts"],
  },
  {
    id: "football",
    nameEn: "Football",
    namePl: "Piłka nożna",
    categories: ["sports"],
  },
  {
    id: "basketball",
    nameEn: "Basketball",
    namePl: "Koszykówka",
    categories: ["sports"],
  },
  {
    id: "volleyball",
    nameEn: "Volleyball",
    namePl: "Siatkówka",
    categories: ["sports"],
  },
  {
    id: "handball",
    nameEn: "Handball",
    namePl: "Piłka ręczna",
    categories: ["sports"],
  },
  {
    id: "athletic-training",
    nameEn: "Athletic Training",
    namePl: "Trening atletyczny",
    categories: ["sports"],
  },
  {
    id: "weight-loss-diet",
    nameEn: "Weight Loss Diet",
    namePl: "Dieta redukcyjna",
    categories: ["nutrition"],
  },
  {
    id: "muscle-gain-diet",
    nameEn: "Muscle Gain Diet",
    namePl: "Dieta na masę",
    categories: ["nutrition"],
  },
  {
    id: "sports-nutrition",
    nameEn: "Sports Nutrition",
    namePl: "Dietetyka sportowa",
    categories: ["nutrition"],
  },
  {
    id: "meal-planning",
    nameEn: "Meal Planning",
    namePl: "Układanie planów żywieniowych",
    categories: ["nutrition"],
  },
  {
    id: "healthy-eating",
    nameEn: "Healthy Eating",
    namePl: "Zdrowe odżywianie",
    categories: ["nutrition"],
  },
  {
    id: "supplementation",
    nameEn: "Supplementation",
    namePl: "Suplementacja",
    categories: ["nutrition"],
  },
  {
    id: "massage",
    nameEn: "Massage",
    namePl: "Masaż",
    categories: ["recovery"],
  },
  {
    id: "injury-recovery",
    nameEn: "Injury Recovery",
    namePl: "Powrót po kontuzji",
    categories: ["recovery"],
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
