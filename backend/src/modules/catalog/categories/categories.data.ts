import { Category } from './categories.types';

/**
 * Categories are the broad groupings (formerly "specializations").
 * Each category contains multiple disciplines.
 */
export const categoriesData: Category[] = [
  {
    id: 'cat_personal_training',
    key: 'personal-training',
    names: { pl: 'Trening personalny', en: 'Personal Training' },
    slugs: { pl: 'trener-personalny', en: 'personal-training' },
    icon: '💪',
    order: 1,
    enabled: true,
  },
  {
    id: 'cat_fitness',
    key: 'fitness-cardio',
    names: { pl: 'Fitness & Cardio', en: 'Fitness & Cardio' },
    slugs: { pl: 'fitness', en: 'fitness' },
    icon: '🏃',
    order: 2,
    enabled: true,
  },
  {
    id: 'cat_yoga',
    key: 'yoga-mobility',
    names: { pl: 'Joga & Mobilność', en: 'Yoga & Mobility' },
    slugs: { pl: 'joga', en: 'yoga' },
    icon: '🧘',
    order: 3,
    enabled: true,
  },
  {
    id: 'cat_dance',
    key: 'dance',
    names: { pl: 'Taniec', en: 'Dance' },
    slugs: { pl: 'taniec', en: 'dance' },
    icon: '🕺',
    order: 4,
    enabled: true,
  },
  {
    id: 'cat_martial_arts',
    key: 'martial-arts',
    names: { pl: 'Sztuki walki', en: 'Martial Arts' },
    slugs: { pl: 'sztuki-walki', en: 'martial-arts' },
    icon: '🥊',
    order: 5,
    enabled: true,
  },
  {
    id: 'cat_sports',
    key: 'sports',
    names: { pl: 'Sporty', en: 'Sports' },
    slugs: { pl: 'sporty', en: 'sports' },
    icon: '⚽',
    order: 6,
    enabled: true,
  },
  {
    id: 'cat_nutrition',
    key: 'nutrition',
    names: { pl: 'Dietetyka', en: 'Nutrition' },
    slugs: { pl: 'dietetyka', en: 'nutrition' },
    icon: '🥗',
    order: 7,
    enabled: true,
  },
  {
    id: 'cat_recovery',
    key: 'recovery',
    names: { pl: 'Regeneracja', en: 'Recovery' },
    slugs: { pl: 'regeneracja', en: 'recovery' },
    icon: '🩹',
    order: 8,
    enabled: true,
  },
];
