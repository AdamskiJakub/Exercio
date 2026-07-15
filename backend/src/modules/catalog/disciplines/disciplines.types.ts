/**
 * A discipline is a specific sport or activity that instructors/enterprises offer.
 * This is the core SEO entity — each discipline gets its own landing page.
 *
 * Examples: boxing, bachata, pilates, crossfit, pole-dance, bjj
 */
export interface Discipline {
  /** Stable unique identifier — never changes (e.g. "disc_boxing") */
  id: string;
  /** Key used in code and data mapping (e.g. "boxing") */
  key: string;
  /** Reference to parent category (e.g. "cat_martial_arts") */
  categoryId: string;
  /** Localized names */
  names: {
    pl: string;
    en: string;
  };
  /** URL slugs per locale */
  slugs: {
    pl: string;
    en: string;
  };
  /** Alternative search terms — helps both search and SEO */
  synonyms: string[];
  /** SEO metadata templates — {discipline} and {city} are replaced at render time */
  seo: {
    titleTemplate: string;
    descriptionTemplate: string;
  };
  /** Popularity score 0-100, manually set. Used for sorting. */
  popularity: number;
  /** If false, discipline is hidden from UI (not ready yet) */
  enabled: boolean;
  /** If false, discipline is available in UI but not indexed by Google */
  indexable: boolean;
  /** Optional emoji icon */
  icon?: string;
}
