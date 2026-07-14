export interface Tag {
  id: string;
  key: string;
  names: { pl: string; en: string };
  categoryIds: string[];
  enabled: boolean;
}
