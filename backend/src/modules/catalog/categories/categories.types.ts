export interface Category {
  id: string;
  key: string;
  names: { pl: string; en: string };
  slugs: { pl: string; en: string };
  icon: string;
  order: number;
  enabled: boolean;
}
