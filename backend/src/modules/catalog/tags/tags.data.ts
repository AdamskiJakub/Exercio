import { Tag } from './tags.types';

export const tagsData: Tag[] = [
  {
    id: 'tag_beginner_friendly',
    key: 'beginner-friendly',
    names: { pl: 'Dla początkujących', en: 'Beginner Friendly' },
    categoryIds: ['cat_personal_training'],
    enabled: true,
  },
  {
    id: 'tag_online',
    key: 'online',
    names: { pl: 'Online', en: 'Online' },
    categoryIds: [],
    enabled: true,
  },
];
