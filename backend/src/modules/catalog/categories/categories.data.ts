import { Category } from './categories.types';

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
];
