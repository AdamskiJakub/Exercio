import { Discipline } from './disciplines.types';

/**
 * Sample data — will be expanded in PR #2.
 * Using Strangler Fig pattern: old config.service.ts still works alongside.
 */
export const disciplinesData: Discipline[] = [
  {
    id: 'disc_boxing',
    key: 'boxing',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Boks', en: 'Boxing' },
    slugs: { pl: 'boks', en: 'boxing' },
    synonyms: ['boks', 'boxing', 'trening boksu', 'pięściarstwo'],
    seo: {
      titleTemplate: 'Trenerzy {discipline} w {city} | Exercio',
      descriptionTemplate:
        'Znajdź najlepszych trenerów {discipline} w {city}. Sprawdź opinie, cennik i dostępne terminy.',
    },
    popularity: 95,
    enabled: true,
    indexable: true,
    icon: '🥊',
  },
  {
    id: 'disc_bachata',
    key: 'bachata',
    categoryId: 'cat_dance',
    names: { pl: 'Bachata', en: 'Bachata' },
    slugs: { pl: 'bachata', en: 'bachata' },
    synonyms: ['bachata', 'bachata dance'],
    seo: {
      titleTemplate: 'Zajęcia {discipline} w {city} | Exercio',
      descriptionTemplate:
        'Szukasz zajęć {discipline} w {city}? Sprawdź instruktorów i szkoły tańca.',
    },
    popularity: 85,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
];
