/**
 * Specialization categories and subcategories configuration
 * This will be later synchronized with backend API
 */

export interface Subcategory {
  id: string;
  nameEn: string;
  namePl: string;
}

export interface SpecializationCategory {
  id: string;
  slug: string;
  nameEn: string;
  namePl: string;
  icon: string;
  order: number;
  subcategories: Subcategory[];
}

export const SPECIALIZATION_CATEGORIES: SpecializationCategory[] = [
  {
    id: 'personal-training',
    slug: 'personal-training',
    nameEn: 'Personal Training',
    namePl: 'Trening personalny',
    icon: '💪',
    order: 1,
    subcategories: [
      { id: 'strength-training', nameEn: 'Strength Training', namePl: 'Trening siłowy' },
      { id: 'functional-training', nameEn: 'Functional Training', namePl: 'Trening funkcjonalny' },
      { id: 'hiit', nameEn: 'HIIT', namePl: 'HIIT' },
      { id: 'calisthenics', nameEn: 'Calisthenics', namePl: 'Kalistenika' },
      { id: 'mobility', nameEn: 'Mobility', namePl: 'Mobilność' },
      { id: 'rehabilitation', nameEn: 'Rehabilitation', namePl: 'Rehabilitacja' },
      { id: 'beginner-friendly', nameEn: 'Beginner Friendly', namePl: 'Dla początkujących' },
    ],
  },
  {
    id: 'fitness-cardio',
    slug: 'fitness-cardio',
    nameEn: 'Fitness & Cardio',
    namePl: 'Fitness & Cardio',
    icon: '🏃',
    order: 2,
    subcategories: [
      { id: 'running', nameEn: 'Running', namePl: 'Bieganie' },
      { id: 'cycling', nameEn: 'Cycling', namePl: 'Kolarstwo' },
      { id: 'swimming', nameEn: 'Swimming', namePl: 'Pływanie' },
      { id: 'hiit', nameEn: 'HIIT', namePl: 'HIIT' },
      { id: 'cardio-training', nameEn: 'Cardio Training', namePl: 'Trening cardio' },
    ],
  },
  {
    id: 'yoga-mobility',
    slug: 'yoga-mobility',
    nameEn: 'Yoga & Mobility',
    namePl: 'Joga & Mobilność',
    icon: '🧘',
    order: 3,
    subcategories: [
      { id: 'hatha', nameEn: 'Hatha Yoga', namePl: 'Hatha Yoga' },
      { id: 'vinyasa', nameEn: 'Vinyasa', namePl: 'Vinyasa' },
      { id: 'yin-yoga', nameEn: 'Yin Yoga', namePl: 'Yin Yoga' },
      { id: 'power-yoga', nameEn: 'Power Yoga', namePl: 'Power Yoga' },
      { id: 'pilates', nameEn: 'Pilates', namePl: 'Pilates' },
      { id: 'stretching', nameEn: 'Stretching', namePl: 'Stretching' },
      { id: 'mobility', nameEn: 'Mobility', namePl: 'Mobilność' },
    ],
  },
  {
    id: 'dance',
    slug: 'dance',
    nameEn: 'Dance',
    namePl: 'Taniec',
    icon: '🕺',
    order: 4,
    subcategories: [
      { id: 'social-dance', nameEn: 'Social Dance', namePl: 'Taniec użytkowy' },
      { id: 'wedding-dance', nameEn: 'Wedding Dance', namePl: 'Pierwszy taniec' },
      { id: 'hip-hop', nameEn: 'Hip-hop', namePl: 'Hip-hop' },
      { id: 'bachata', nameEn: 'Bachata', namePl: 'Bachata' },
      { id: 'salsa', nameEn: 'Salsa', namePl: 'Salsa' },
      { id: 'kizomba', nameEn: 'Kizomba', namePl: 'Kizomba' },
      { id: 'reggaeton', nameEn: 'Reggaeton', namePl: 'Reggaeton' },
      { id: 'breakdance', nameEn: 'Breakdance', namePl: 'Break dance' },
      { id: 'heels', nameEn: 'High Heels', namePl: 'High Heels' },
      { id: 'pole-dance', nameEn: 'Pole Dance', namePl: 'Pole Dance' },
      { id: 'ballet', nameEn: 'Ballet', namePl: 'Balet' },
    ],
  },
  {
    id: 'martial-arts',
    slug: 'martial-arts',
    nameEn: 'Martial Arts',
    namePl: 'Sztuki walki',
    icon: '🥊',
    order: 5,
    subcategories: [
      { id: 'boxing', nameEn: 'Boxing', namePl: 'Boks' },
      { id: 'mma', nameEn: 'MMA', namePl: 'MMA' },
      { id: 'muay-thai', nameEn: 'Muay Thai', namePl: 'Muay Thai' },
      { id: 'kickboxing', nameEn: 'Kickboxing', namePl: 'Kickboxing' },
      { id: 'bjj', nameEn: 'Brazilian Jiu-Jitsu', namePl: 'Brazylijskie Jiu-Jitsu' },
      { id: 'karate', nameEn: 'Karate', namePl: 'Karate' },
      { id: 'judo', nameEn: 'Judo', namePl: 'Judo' },
      { id: 'taekwondo', nameEn: 'Taekwondo', namePl: 'Taekwondo' },
      { id: 'krav-maga', nameEn: 'Krav Maga', namePl: 'Krav Maga' },
    ],
  },
  {
    id: 'sports',
    slug: 'sports',
    nameEn: 'Sports',
    namePl: 'Sporty',
    icon: '⚽',
    order: 6,
    subcategories: [
      { id: 'football', nameEn: 'Football', namePl: 'Piłka nożna' },
      { id: 'basketball', nameEn: 'Basketball', namePl: 'Koszykówka' },
      { id: 'volleyball', nameEn: 'Volleyball', namePl: 'Siatkówka' },
      { id: 'handball', nameEn: 'Handball', namePl: 'Piłka ręczna' },
      { id: 'athletic-training', nameEn: 'Athletic Training', namePl: 'Trening atletyczny' },
    ],
  },
  {
    id: 'nutrition',
    slug: 'nutrition',
    nameEn: 'Nutrition',
    namePl: 'Dietetyka',
    icon: '🥗',
    order: 7,
    subcategories: [
      { id: 'weight-loss-diet', nameEn: 'Weight Loss Diet', namePl: 'Dieta redukcyjna' },
      { id: 'muscle-gain-diet', nameEn: 'Muscle Gain Diet', namePl: 'Dieta na masę' },
      { id: 'sports-nutrition', nameEn: 'Sports Nutrition', namePl: 'Dietetyka sportowa' },
      { id: 'meal-planning', nameEn: 'Meal Planning', namePl: 'Układanie planów żywieniowych' },
      { id: 'healthy-eating', nameEn: 'Healthy Eating', namePl: 'Zdrowe odżywianie' },
      { id: 'supplementation', nameEn: 'Supplementation', namePl: 'Suplementacja' },
    ],
  },
  {
    id: 'recovery',
    slug: 'recovery',
    nameEn: 'Recovery',
    namePl: 'Regeneracja',
    icon: '🩹',
    order: 8,
    subcategories: [
      { id: 'massage', nameEn: 'Massage', namePl: 'Masaż' },
      { id: 'stretching', nameEn: 'Stretching', namePl: 'Stretching' },
      { id: 'mobility', nameEn: 'Mobility', namePl: 'Mobilność' },
      { id: 'injury-recovery', nameEn: 'Injury Recovery', namePl: 'Powrót po kontuzji' },
    ],
  },
];

/**
 * Helper functions
 */

export function getCategoryById(id: string): SpecializationCategory | undefined {
  return SPECIALIZATION_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): SpecializationCategory | undefined {
  return SPECIALIZATION_CATEGORIES.find((cat) => cat.slug === slug);
}

export function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Subcategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}

export function findSubcategoryById(subcategoryId: string): Subcategory | undefined {
  for (const category of SPECIALIZATION_CATEGORIES) {
    const sub = category.subcategories.find((s) => s.id === subcategoryId);
    if (sub) return sub;
  }
  return undefined;
}

export function getAllSubcategories(): Subcategory[] {
  return SPECIALIZATION_CATEGORIES.flatMap((cat) => cat.subcategories);
}

/**
 * Get localized name for any specialization (category or subcategory)
 */
export function getSpecializationName(id: string, locale: string): string {
  // Check categories first
  const category = getCategoryById(id);
  if (category) {
    return locale === 'pl' ? category.namePl : category.nameEn;
  }
  
  // Check subcategories
  const subcategory = findSubcategoryById(id);
  if (subcategory) {
    return locale === 'pl' ? subcategory.namePl : subcategory.nameEn;
  }
  
  // Fallback
  return id;
}
