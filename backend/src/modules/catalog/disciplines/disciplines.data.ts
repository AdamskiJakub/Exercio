import { Discipline } from './disciplines.types';

/**
 * TOP 30 disciplines for SEO.
 * Each discipline maps to a category and has its own landing page.
 * Ordered by estimated search popularity (highest first).
 */
export const disciplinesData: Discipline[] = [
  // === MARTIAL ARTS ===
  {
    id: 'disc_boxing',
    key: 'boxing',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Boks', en: 'Boxing' },
    slugs: { pl: 'boks', en: 'boxing' },
    synonyms: [
      'boks',
      'boxing',
      'trening boksu',
      'pięściarstwo',
      'boks trening',
    ],
    seo: {
      titleTemplate: 'Trenerzy boksu w {city} | Exercio',
      descriptionTemplate:
        'Szukasz trenera boksu w {city}? Sprawdź opinie, cennik i dostępne terminy. Profesjonalny trening boksu dla początkujących i zaawansowanych.',
    },
    popularity: 95,
    enabled: true,
    indexable: true,
    icon: '🥊',
  },
  {
    id: 'disc_mma',
    key: 'mma',
    categoryId: 'cat_martial_arts',
    names: { pl: 'MMA', en: 'MMA' },
    slugs: { pl: 'mma', en: 'mma' },
    synonyms: ['mma', 'mixed martial arts', 'mieszane sztuki walki'],
    seo: {
      titleTemplate: 'Trening MMA w {city} | Exercio',
      descriptionTemplate:
        'Znajdź kluby i trenerów MMA w {city}. Sprawdź ofertę zajęć MMA dla początkujących i zaawansowanych.',
    },
    popularity: 93,
    enabled: true,
    indexable: true,
    icon: '🥊',
  },
  {
    id: 'disc_bjj',
    key: 'bjj',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Brazylijskie Jiu-Jitsu', en: 'Brazilian Jiu-Jitsu' },
    slugs: { pl: 'bjj', en: 'bjj' },
    synonyms: [
      'bjj',
      'brazylijskie jiu-jitsu',
      'brazilian jiu-jitsu',
      'jiu jitsu',
      'jiu-jitsu',
    ],
    seo: {
      titleTemplate: 'Zajęcia BJJ w {city} | Exercio',
      descriptionTemplate:
        'Szukasz treningu BJJ w {city}? Sprawdź instruktorów brazylijskiego jiu-jitsu i kluby.',
    },
    popularity: 88,
    enabled: true,
    indexable: true,
    icon: '🥋',
  },
  {
    id: 'disc_kickboxing',
    key: 'kickboxing',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Kickboxing', en: 'Kickboxing' },
    slugs: { pl: 'kickboxing', en: 'kickboxing' },
    synonyms: ['kickboxing', 'kick boxing'],
    seo: {
      titleTemplate: 'Kickboxing w {city} | Exercio',
      descriptionTemplate:
        'Znajdź najlepsze zajęcia kickboxingu w {city}. Trening dla początkujących i zaawansowanych.',
    },
    popularity: 85,
    enabled: true,
    indexable: true,
    icon: '🥊',
  },
  {
    id: 'disc_muay_thai',
    key: 'muay-thai',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Muay Thai', en: 'Muay Thai' },
    slugs: { pl: 'muay-thai', en: 'muay-thai' },
    synonyms: ['muay thai', 'tajski boks', 'boks tajski'],
    seo: {
      titleTemplate: 'Muay Thai w {city} | Exercio',
      descriptionTemplate:
        'Trening Muay Thai w {city} — sprawdź kluby i instruktorów. Boks tajski dla każdego.',
    },
    popularity: 80,
    enabled: true,
    indexable: true,
    icon: '🥊',
  },
  {
    id: 'disc_karate',
    key: 'karate',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Karate', en: 'Karate' },
    slugs: { pl: 'karate', en: 'karate' },
    synonyms: ['karate', 'karate tradycyjne', 'karate shotokan'],
    seo: {
      titleTemplate: 'Zajęcia karate w {city} | Exercio',
      descriptionTemplate:
        'Szukasz zajęć karate w {city}? Sprawdź instruktorów i kluby karate.',
    },
    popularity: 75,
    enabled: true,
    indexable: true,
    icon: '🥋',
  },
  {
    id: 'disc_krav_maga',
    key: 'krav-maga',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Krav Maga', en: 'Krav Maga' },
    slugs: { pl: 'krav-maga', en: 'krav-maga' },
    synonyms: ['krav maga', 'krav-maga'],
    seo: {
      titleTemplate: 'Krav Maga w {city} | Exercio',
      descriptionTemplate:
        'Trening Krav Maga w {city} — samoobrona i kondycja. Sprawdź dostępnych instruktorów.',
    },
    popularity: 72,
    enabled: true,
    indexable: true,
    icon: '🥋',
  },
  {
    id: 'disc_judo',
    key: 'judo',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Judo', en: 'Judo' },
    slugs: { pl: 'judo', en: 'judo' },
    synonyms: ['judo'],
    seo: {
      titleTemplate: 'Judo w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia judo w {city} — trening dla dzieci i dorosłych. Sprawdź kluby judo.',
    },
    popularity: 70,
    enabled: true,
    indexable: true,
    icon: '🥋',
  },
  {
    id: 'disc_taekwondo',
    key: 'taekwondo',
    categoryId: 'cat_martial_arts',
    names: { pl: 'Taekwondo', en: 'Taekwondo' },
    slugs: { pl: 'taekwondo', en: 'taekwondo' },
    synonyms: ['taekwondo', 'tae kwon do'],
    seo: {
      titleTemplate: 'Taekwondo w {city} | Exercio',
      descriptionTemplate:
        'Trening taekwondo w {city} — zajęcia dla dzieci i dorosłych. Sprawdź ofertę.',
    },
    popularity: 68,
    enabled: true,
    indexable: true,
    icon: '🥋',
  },

  // === DANCE ===
  {
    id: 'disc_bachata',
    key: 'bachata',
    categoryId: 'cat_dance',
    names: { pl: 'Bachata', en: 'Bachata' },
    slugs: { pl: 'bachata', en: 'bachata' },
    synonyms: ['bachata', 'taniec bachata', 'bachata dance'],
    seo: {
      titleTemplate: 'Zajęcia bachaty w {city} | Exercio',
      descriptionTemplate:
        'Szukasz zajęć bachaty w {city}? Sprawdź instruktorów i szkoły tańca.',
    },
    popularity: 90,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_salsa',
    key: 'salsa',
    categoryId: 'cat_dance',
    names: { pl: 'Salsa', en: 'Salsa' },
    slugs: { pl: 'salsa', en: 'salsa' },
    synonyms: ['salsa', 'taniec salsa', 'salsa dance'],
    seo: {
      titleTemplate: 'Zajęcia salsy w {city} | Exercio',
      descriptionTemplate:
        'Nauka salsy w {city} — zajęcia dla początkujących i zaawansowanych. Sprawdź szkoły tańca.',
    },
    popularity: 88,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_kizomba',
    key: 'kizomba',
    categoryId: 'cat_dance',
    names: { pl: 'Kizomba', en: 'Kizomba' },
    slugs: { pl: 'kizomba', en: 'kizomba' },
    synonyms: ['kizomba', 'taniec kizomba'],
    seo: {
      titleTemplate: 'Kizomba w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia kizomby w {city} — zmysłowy taniec dla par. Sprawdź instruktorów.',
    },
    popularity: 78,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_hip_hop',
    key: 'hip-hop',
    categoryId: 'cat_dance',
    names: { pl: 'Hip-hop', en: 'Hip-hop' },
    slugs: { pl: 'hip-hop', en: 'hip-hop' },
    synonyms: ['hip hop', 'hip-hop', 'taniec hip hop'],
    seo: {
      titleTemplate: 'Taniec hip-hop w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia hip-hop w {city} — taniec nowoczesny dla dzieci i dorosłych.',
    },
    popularity: 82,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_pole_dance',
    key: 'pole-dance',
    categoryId: 'cat_dance',
    names: { pl: 'Pole Dance', en: 'Pole Dance' },
    slugs: { pl: 'pole-dance', en: 'pole-dance' },
    synonyms: ['pole dance', 'taniec na rurze', 'pole fitness', 'pole'],
    seo: {
      titleTemplate: 'Pole Dance w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia pole dance w {city} — taniec na rurze dla początkujących i zaawansowanych.',
    },
    popularity: 85,
    enabled: true,
    indexable: true,
    icon: '💃',
  },
  {
    id: 'disc_heels',
    key: 'heels',
    categoryId: 'cat_dance',
    names: { pl: 'High Heels', en: 'High Heels' },
    slugs: { pl: 'high-heels', en: 'high-heels' },
    synonyms: ['high heels', 'heels dance', 'taniec na szpilkach'],
    seo: {
      titleTemplate: 'High Heels w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia high heels w {city} — taniec na szpilkach. Sprawdź instruktorów.',
    },
    popularity: 76,
    enabled: true,
    indexable: true,
    icon: '👠',
  },
  {
    id: 'disc_ballet',
    key: 'ballet',
    categoryId: 'cat_dance',
    names: { pl: 'Balet', en: 'Ballet' },
    slugs: { pl: 'balet', en: 'ballet' },
    synonyms: ['balet', 'ballet', 'taniec klasyczny'],
    seo: {
      titleTemplate: 'Balet w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia baletu w {city} — nauka tańca klasycznego dla dzieci i dorosłych.',
    },
    popularity: 74,
    enabled: true,
    indexable: true,
    icon: '🩰',
  },
  {
    id: 'disc_breakdance',
    key: 'breakdance',
    categoryId: 'cat_dance',
    names: { pl: 'Break dance', en: 'Breakdance' },
    slugs: { pl: 'break-dance', en: 'breakdance' },
    synonyms: ['breakdance', 'break dance', 'breaking'],
    seo: {
      titleTemplate: 'Break dance w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia break dance w {city} — taniec i akrobatyka dla młodzieży i dorosłych.',
    },
    popularity: 72,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_reggaeton',
    key: 'reggaeton',
    categoryId: 'cat_dance',
    names: { pl: 'Reggaeton', en: 'Reggaeton' },
    slugs: { pl: 'reggaeton', en: 'reggaeton' },
    synonyms: ['reggaeton', 'reggaeton dance'],
    seo: {
      titleTemplate: 'Reggaeton w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia reggaeton w {city} — energetyczny taniec latynoski.',
    },
    popularity: 70,
    enabled: true,
    indexable: true,
    icon: '🕺',
  },
  {
    id: 'disc_wedding_dance',
    key: 'wedding-dance',
    categoryId: 'cat_dance',
    names: { pl: 'Pierwszy taniec', en: 'Wedding Dance' },
    slugs: { pl: 'pierwszy-taniec', en: 'wedding-dance' },
    synonyms: [
      'pierwszy taniec',
      'wedding dance',
      'taniec weselny',
      'nauka pierwszego tańca',
    ],
    seo: {
      titleTemplate: 'Nauka pierwszego tańca w {city} | Exercio',
      descriptionTemplate:
        'Przygotuj się do pierwszego tańca weselnego w {city}. Sprawdź instruktorów tańca.',
    },
    popularity: 78,
    enabled: true,
    indexable: true,
    icon: '💑',
  },

  // === FITNESS ===
  {
    id: 'disc_pilates',
    key: 'pilates',
    categoryId: 'cat_fitness',
    names: { pl: 'Pilates', en: 'Pilates' },
    slugs: { pl: 'pilates', en: 'pilates' },
    synonyms: ['pilates', 'pilates trening'],
    seo: {
      titleTemplate: 'Pilates w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia pilates w {city} — wzmocnij ciało i popraw elastyczność. Sprawdź instruktorów.',
    },
    popularity: 92,
    enabled: true,
    indexable: true,
    icon: '🧘',
  },
  {
    id: 'disc_hiit',
    key: 'hiit',
    categoryId: 'cat_fitness',
    names: { pl: 'HIIT', en: 'HIIT' },
    slugs: { pl: 'hiit', en: 'hiit' },
    synonyms: [
      'hiit',
      'high intensity interval training',
      'trening interwałowy',
    ],
    seo: {
      titleTemplate: 'Trening HIIT w {city} | Exercio',
      descriptionTemplate:
        'Trening interwałowy HIIT w {city} — spal kalorie i popraw kondycję. Sprawdź zajęcia.',
    },
    popularity: 90,
    enabled: true,
    indexable: true,
    icon: '🔥',
  },
  {
    id: 'disc_crossfit',
    key: 'crossfit',
    categoryId: 'cat_fitness',
    names: { pl: 'CrossFit', en: 'CrossFit' },
    slugs: { pl: 'crossfit', en: 'crossfit' },
    synonyms: ['crossfit', 'cross fit', 'crossfit trening'],
    seo: {
      titleTemplate: 'CrossFit w {city} | Exercio',
      descriptionTemplate:
        'Trening CrossFit w {city} — siła, kondycja i wytrzymałość. Sprawdź boxy CrossFit.',
    },
    popularity: 89,
    enabled: true,
    indexable: true,
    icon: '💪',
  },
  {
    id: 'disc_stretching',
    key: 'stretching',
    categoryId: 'cat_fitness',
    names: { pl: 'Stretching', en: 'Stretching' },
    slugs: { pl: 'stretching', en: 'stretching' },
    synonyms: ['stretching', 'rozciąganie', 'elastyczność'],
    seo: {
      titleTemplate: 'Stretching w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia stretchingu w {city} — popraw elastyczność i zregeneruj ciało.',
    },
    popularity: 82,
    enabled: true,
    indexable: true,
    icon: '🤸',
  },
  {
    id: 'disc_calisthenics',
    key: 'calisthenics',
    categoryId: 'cat_fitness',
    names: { pl: 'Kalistenika', en: 'Calisthenics' },
    slugs: { pl: 'kalistenika', en: 'calisthenics' },
    synonyms: [
      'kalistenika',
      'calisthenics',
      'trening z masą własnego ciała',
      'street workout',
    ],
    seo: {
      titleTemplate: 'Kalistenika w {city} | Exercio',
      descriptionTemplate:
        'Trening kalisteniki w {city} — ćwicz z masą własnego ciała. Sprawdź instruktorów.',
    },
    popularity: 76,
    enabled: true,
    indexable: true,
    icon: '💪',
  },
  {
    id: 'disc_mobility',
    key: 'mobility',
    categoryId: 'cat_fitness',
    names: { pl: 'Mobilność', en: 'Mobility' },
    slugs: { pl: 'mobilnosc', en: 'mobility' },
    synonyms: [
      'mobilność',
      'mobility',
      'trening mobilności',
      'ruchomość stawów',
    ],
    seo: {
      titleTemplate: 'Trening mobilności w {city} | Exercio',
      descriptionTemplate:
        'Popraw mobilność w {city} — zajęcia z zakresu ruchomości stawów i elastyczności.',
    },
    popularity: 72,
    enabled: true,
    indexable: true,
    icon: '🤸',
  },
  {
    id: 'disc_running',
    key: 'running',
    categoryId: 'cat_fitness',
    names: { pl: 'Bieganie', en: 'Running' },
    slugs: { pl: 'bieganie', en: 'running' },
    synonyms: ['bieganie', 'running', 'trening biegowy', 'biegi'],
    seo: {
      titleTemplate: 'Trening biegowy w {city} | Exercio',
      descriptionTemplate:
        'Przygotowanie biegowe w {city} — trenerzy biegania, plany treningowe i grupy biegowe.',
    },
    popularity: 80,
    enabled: true,
    indexable: true,
    icon: '🏃',
  },

  // === YOGA ===
  {
    id: 'disc_yoga',
    key: 'yoga',
    categoryId: 'cat_yoga',
    names: { pl: 'Joga', en: 'Yoga' },
    slugs: { pl: 'joga', en: 'yoga' },
    synonyms: ['joga', 'yoga', 'zajęcia jogi', 'trening jogi'],
    seo: {
      titleTemplate: 'Zajęcia jogi w {city} | Exercio',
      descriptionTemplate:
        'Joga w {city} — znajdź instruktora jogi. Hatha, vinyasa, yin yoga i więcej.',
    },
    popularity: 94,
    enabled: true,
    indexable: true,
    icon: '🧘',
  },

  // === PERSONAL TRAINING ===
  {
    id: 'disc_personal_training',
    key: 'personal-training',
    categoryId: 'cat_personal_training',
    names: { pl: 'Trening personalny', en: 'Personal Training' },
    slugs: { pl: 'trener-personalny', en: 'personal-training' },
    synonyms: [
      'trener personalny',
      'personal training',
      'trening personalny',
      'trener osobisty',
    ],
    seo: {
      titleTemplate: 'Trener personalny w {city} | Exercio',
      descriptionTemplate:
        'Znajdź najlepszego trenera personalnego w {city}. Indywidualne treningi dopasowane do Twoich celów.',
    },
    popularity: 98,
    enabled: true,
    indexable: true,
    icon: '💪',
  },

  // === SPORTS ===
  {
    id: 'disc_swimming',
    key: 'swimming',
    categoryId: 'cat_sports',
    names: { pl: 'Pływanie', en: 'Swimming' },
    slugs: { pl: 'plywanie', en: 'swimming' },
    synonyms: ['pływanie', 'swimming', 'nauka pływania', 'trener pływania'],
    seo: {
      titleTemplate: 'Nauka pływania w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia z pływania w {city} — nauka pływania dla dzieci i dorosłych. Sprawdź instruktorów.',
    },
    popularity: 86,
    enabled: true,
    indexable: true,
    icon: '🏊',
  },
  {
    id: 'disc_tennis',
    key: 'tennis',
    categoryId: 'cat_sports',
    names: { pl: 'Tenis', en: 'Tennis' },
    slugs: { pl: 'tenis', en: 'tennis' },
    synonyms: ['tenis', 'tennis', 'nauka tenisa', 'trener tenisa'],
    seo: {
      titleTemplate: 'Tenis w {city} | Exercio',
      descriptionTemplate:
        'Trening tenisa w {city} — korepetycje tenisowe dla dzieci i dorosłych.',
    },
    popularity: 78,
    enabled: true,
    indexable: true,
    icon: '🎾',
  },
  {
    id: 'disc_football',
    key: 'football',
    categoryId: 'cat_sports',
    names: { pl: 'Piłka nożna', en: 'Football' },
    slugs: { pl: 'pilka-nozna', en: 'football' },
    synonyms: [
      'piłka nożna',
      'football',
      'trener piłki nożnej',
      'trening piłkarski',
    ],
    seo: {
      titleTemplate: 'Trening piłki nożnej w {city} | Exercio',
      descriptionTemplate:
        'Zajęcia piłki nożnej w {city} — treningi indywidualne i grupowe dla dzieci i dorosłych.',
    },
    popularity: 84,
    enabled: true,
    indexable: true,
    icon: '⚽',
  },

  // === NUTRITION ===
  {
    id: 'disc_nutrition',
    key: 'nutrition',
    categoryId: 'cat_nutrition',
    names: { pl: 'Dietetyka', en: 'Nutrition' },
    slugs: { pl: 'dietetyk', en: 'nutrition' },
    synonyms: [
      'dietetyk',
      'dietetyka',
      'nutrition',
      'diet coach',
      'doradca żywieniowy',
    ],
    seo: {
      titleTemplate: 'Dietetyk w {city} | Exercio',
      descriptionTemplate:
        'Znajdź dietetyka w {city}. Układanie planów żywieniowych, dieta redukcyjna i sportowa.',
    },
    popularity: 82,
    enabled: true,
    indexable: true,
    icon: '🥗',
  },

  // === RECOVERY ===
  {
    id: 'disc_massage',
    key: 'massage',
    categoryId: 'cat_recovery',
    names: { pl: 'Masaż', en: 'Massage' },
    slugs: { pl: 'masaz', en: 'massage' },
    synonyms: ['masaż', 'massage', 'masaż sportowy', 'masaż relaksacyjny'],
    seo: {
      titleTemplate: 'Masaż w {city} | Exercio',
      descriptionTemplate:
        'Masaż sportowy i relaksacyjny w {city}. Sprawdź specjalistów od masażu.',
    },
    popularity: 80,
    enabled: true,
    indexable: true,
    icon: '💆',
  },
];
