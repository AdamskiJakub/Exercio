import type { EnterpriseNews } from "./enterprise";

/**
 * Filter mode for the news list.
 */
export type NewsFilter = "all" | "post" | "link";

/**
 * Props for the main EnterpriseNews component.
 */
export interface EnterpriseNewsProps {
  news: EnterpriseNews[];
}

/**
 * Props for a single news card (shared between post and link types).
 */
export interface NewsCardProps {
  item: EnterpriseNews;
  onSelect?: (item: EnterpriseNews) => void;
  isLink?: boolean;
}

/**
 * Props for the social share section in the post detail modal.
 */
export interface SocialShareProps {
  copied: boolean;
  onCopyLink: () => void;
}

/**
 * Props for the post detail modal.
 */
export interface PostDetailModalProps {
  selectedPost: EnterpriseNews | null;
  onClose: () => void;
}

/**
 * A single filter tab definition.
 */
export interface FilterTab {
  value: NewsFilter;
  label: string;
  count: number;
}
