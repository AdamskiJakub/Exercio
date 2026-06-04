import { Injectable } from '@nestjs/common';

@Injectable()
export class StaticConfigService {
  private readonly tags = [
    {
      id: 'strength-training',
      nameEn: 'Strength Training',
      namePl: 'Trening siłowy',
      categories: ['personal-training'],
    },
    {
      id: 'functional-training',
      nameEn: 'Functional Training',
      namePl: 'Trening funkcjonalny',
      categories: ['personal-training'],
    },
    {
      id: 'hiit',
      nameEn: 'HIIT',
      namePl: 'HIIT',
      categories: ['personal-training', 'fitness-cardio'],
    },
    {
      id: 'calisthenics',
      nameEn: 'Calisthenics',
      namePl: 'Kalistenika',
      categories: ['personal-training'],
    },
    {
      id: 'mobility',
      nameEn: 'Mobility',
      namePl: 'Mobilność',
      categories: ['personal-training', 'yoga-mobility', 'recovery'],
    },
    {
      id: 'rehabilitation',
      nameEn: 'Rehabilitation',
      namePl: 'Rehabilitacja',
      categories: ['personal-training', 'recovery'],
    },
    {
      id: 'beginner-friendly',
      nameEn: 'Beginner Friendly',
      namePl: 'Dla początkujących',
      categories: ['personal-training'],
    },
    {
      id: 'running',
      nameEn: 'Running',
      namePl: 'Bieganie',
      categories: ['fitness-cardio'],
    },
    {
      id: 'cycling',
      nameEn: 'Cycling',
      namePl: 'Kolarstwo',
      categories: ['fitness-cardio'],
    },
    {
      id: 'swimming',
      nameEn: 'Swimming',
      namePl: 'Pływanie',
      categories: ['fitness-cardio'],
    },
    {
      id: 'cardio-training',
      nameEn: 'Cardio Training',
      namePl: 'Trening cardio',
      categories: ['fitness-cardio'],
    },
    {
      id: 'hatha',
      nameEn: 'Hatha Yoga',
      namePl: 'Hatha Yoga',
      categories: ['yoga-mobility'],
    },
    {
      id: 'vinyasa',
      nameEn: 'Vinyasa',
      namePl: 'Vinyasa',
      categories: ['yoga-mobility'],
    },
    {
      id: 'yin-yoga',
      nameEn: 'Yin Yoga',
      namePl: 'Yin Yoga',
      categories: ['yoga-mobility'],
    },
    {
      id: 'power-yoga',
      nameEn: 'Power Yoga',
      namePl: 'Power Yoga',
      categories: ['yoga-mobility'],
    },
    {
      id: 'pilates',
      nameEn: 'Pilates',
      namePl: 'Pilates',
      categories: ['yoga-mobility'],
    },
    {
      id: 'stretching',
      nameEn: 'Stretching',
      namePl: 'Stretching',
      categories: ['yoga-mobility', 'recovery'],
    },
    {
      id: 'social-dance',
      nameEn: 'Social Dance',
      namePl: 'Taniec użytkowy',
      categories: ['dance'],
    },
    {
      id: 'wedding-dance',
      nameEn: 'Wedding Dance',
      namePl: 'Pierwszy taniec',
      categories: ['dance'],
    },
    {
      id: 'hip-hop',
      nameEn: 'Hip-hop',
      namePl: 'Hip-hop',
      categories: ['dance'],
    },
    {
      id: 'bachata',
      nameEn: 'Bachata',
      namePl: 'Bachata',
      categories: ['dance'],
    },
    {
      id: 'salsa',
      nameEn: 'Salsa',
      namePl: 'Salsa',
      categories: ['dance'],
    },
    {
      id: 'kizomba',
      nameEn: 'Kizomba',
      namePl: 'Kizomba',
      categories: ['dance'],
    },
    {
      id: 'reggaeton',
      nameEn: 'Reggaeton',
      namePl: 'Reggaeton',
      categories: ['dance'],
    },
    {
      id: 'breakdance',
      nameEn: 'Breakdance',
      namePl: 'Break dance',
      categories: ['dance'],
    },
    {
      id: 'heels',
      nameEn: 'High Heels',
      namePl: 'High Heels',
      categories: ['dance'],
    },
    {
      id: 'pole-dance',
      nameEn: 'Pole Dance',
      namePl: 'Pole Dance',
      categories: ['dance'],
    },
    {
      id: 'ballet',
      nameEn: 'Ballet',
      namePl: 'Balet',
      categories: ['dance'],
    },
    {
      id: 'boxing',
      nameEn: 'Boxing',
      namePl: 'Boks',
      categories: ['martial-arts'],
    },
    {
      id: 'mma',
      nameEn: 'MMA',
      namePl: 'MMA',
      categories: ['martial-arts'],
    },
    {
      id: 'muay-thai',
      nameEn: 'Muay Thai',
      namePl: 'Muay Thai',
      categories: ['martial-arts'],
    },
    {
      id: 'kickboxing',
      nameEn: 'Kickboxing',
      namePl: 'Kickboxing',
      categories: ['martial-arts'],
    },
    {
      id: 'bjj',
      nameEn: 'Brazilian Jiu-Jitsu',
      namePl: 'Brazylijskie Jiu-Jitsu',
      categories: ['martial-arts'],
    },
    {
      id: 'karate',
      nameEn: 'Karate',
      namePl: 'Karate',
      categories: ['martial-arts'],
    },
    {
      id: 'judo',
      nameEn: 'Judo',
      namePl: 'Judo',
      categories: ['martial-arts'],
    },
    {
      id: 'taekwondo',
      nameEn: 'Taekwondo',
      namePl: 'Taekwondo',
      categories: ['martial-arts'],
    },
    {
      id: 'krav-maga',
      nameEn: 'Krav Maga',
      namePl: 'Krav Maga',
      categories: ['martial-arts'],
    },
    {
      id: 'football',
      nameEn: 'Football',
      namePl: 'Piłka nożna',
      categories: ['sports'],
    },
    {
      id: 'basketball',
      nameEn: 'Basketball',
      namePl: 'Koszykówka',
      categories: ['sports'],
    },
    {
      id: 'volleyball',
      nameEn: 'Volleyball',
      namePl: 'Siatkówka',
      categories: ['sports'],
    },
    {
      id: 'handball',
      nameEn: 'Handball',
      namePl: 'Piłka ręczna',
      categories: ['sports'],
    },
    {
      id: 'athletic-training',
      nameEn: 'Athletic Training',
      namePl: 'Trening atletyczny',
      categories: ['sports'],
    },
    {
      id: 'weight-loss-diet',
      nameEn: 'Weight Loss Diet',
      namePl: 'Dieta redukcyjna',
      categories: ['nutrition'],
    },
    {
      id: 'muscle-gain-diet',
      nameEn: 'Muscle Gain Diet',
      namePl: 'Dieta na masę',
      categories: ['nutrition'],
    },
    {
      id: 'sports-nutrition',
      nameEn: 'Sports Nutrition',
      namePl: 'Dietetyka sportowa',
      categories: ['nutrition'],
    },
    {
      id: 'meal-planning',
      nameEn: 'Meal Planning',
      namePl: 'Układanie planów żywieniowych',
      categories: ['nutrition'],
    },
    {
      id: 'healthy-eating',
      nameEn: 'Healthy Eating',
      namePl: 'Zdrowe odżywianie',
      categories: ['nutrition'],
    },
    {
      id: 'supplementation',
      nameEn: 'Supplementation',
      namePl: 'Suplementacja',
      categories: ['nutrition'],
    },
    {
      id: 'massage',
      nameEn: 'Massage',
      namePl: 'Masaż',
      categories: ['recovery'],
    },
    {
      id: 'injury-recovery',
      nameEn: 'Injury Recovery',
      namePl: 'Powrót po kontuzji',
      categories: ['recovery'],
    },
  ];

  private readonly specializations = [
    {
      id: 'personal-training',
      nameEn: 'Personal Training',
      namePl: 'Trening personalny',
      icon: '💪',
      order: 1,
    },
    {
      id: 'fitness-cardio',
      nameEn: 'Fitness & Cardio',
      namePl: 'Fitness & Cardio',
      icon: '🏃',
      order: 2,
    },
    {
      id: 'yoga-mobility',
      nameEn: 'Yoga & Mobility',
      namePl: 'Joga & Mobilność',
      icon: '🧘',
      order: 3,
    },
    {
      id: 'dance',
      nameEn: 'Dance',
      namePl: 'Taniec',
      icon: '🕺',
      order: 4,
    },
    {
      id: 'martial-arts',
      nameEn: 'Martial Arts',
      namePl: 'Sztuki walki',
      icon: '🥊',
      order: 5,
    },
    {
      id: 'sports',
      nameEn: 'Sports',
      namePl: 'Sporty',
      icon: '⚽',
      order: 6,
    },
    {
      id: 'nutrition',
      nameEn: 'Nutrition',
      namePl: 'Dietetyka',
      icon: '🥗',
      order: 7,
    },
    {
      id: 'recovery',
      nameEn: 'Recovery',
      namePl: 'Regeneracja',
      icon: '🩹',
      order: 8,
    },
  ];

  private readonly goals = [
    { id: 'weight_loss', nameEn: 'Weight Loss', namePl: 'Redukcja wagi', icon: '🎯' },
    { id: 'muscle_gain', nameEn: 'Muscle Gain', namePl: 'Budowa masy mięśniowej', icon: '💪' },
    { id: 'endurance', nameEn: 'Endurance', namePl: 'Wytrzymałość', icon: '🏃' },
    { id: 'flexibility', nameEn: 'Flexibility', namePl: 'Elastyczność', icon: '🧘' },
    { id: 'strength', nameEn: 'Strength', namePl: 'Siła', icon: '💪' },
    { id: 'health', nameEn: 'General Health', namePl: 'Ogólne zdrowie', icon: '❤️' },
    { id: 'sport_performance', nameEn: 'Sport Performance', namePl: 'Wyniki sportowe', icon: '⚡' },
  ];

  // Pre-computed Sets for O(1) validation lookup
  private readonly validTagIds: Set<string>;
  private readonly validSpecializationIds: Set<string>;
  private readonly validGoalIds: Set<string>;

  constructor() {
    // Initialize Sets once for fast lookups
    this.validTagIds = new Set(this.tags.map((tag) => tag.id));
    this.validSpecializationIds = new Set(this.specializations.map((spec) => spec.id));
    this.validGoalIds = new Set(this.goals.map((goal) => goal.id));
  }

  getAllTags() {
    return this.tags;
  }

  getAllSpecializations() {
    return this.specializations;
  }

  getAllGoals() {
    return this.goals;
  }

  isValidTag(tagId: string): boolean {
    return this.validTagIds.has(tagId);
  }

  isValidSpecialization(specializationId: string): boolean {
    return this.validSpecializationIds.has(specializationId);
  }

  isValidGoal(goalId: string): boolean {
    return this.validGoalIds.has(goalId);
  }

  getTagsByCategory(categoryId: string) {
    return this.tags.filter(tag => tag.categories.includes(categoryId))
  }

}
