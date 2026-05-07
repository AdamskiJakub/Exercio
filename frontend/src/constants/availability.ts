export const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0] as const; // Mon-Sun

export const SESSION_DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
] as const;

export const MIN_NOTICE_HOURS_OPTIONS = [
  { value: 0, key: 'noMinimum' },
  { value: 12, key: 'hours', count: 12 },
  { value: 24, key: 'hours', count: 24 },
  { value: 48, key: 'hours', count: 48 },
  { value: 72, key: 'hours', count: 72 },
  { value: 168, key: 'week' },
] as const;
