export interface SearchFilters {
  city: string;
  specialization: string;
  tags?: string[];
  search?: string;
}

export interface InstructorFilters extends SearchFilters {
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  experience?: "beginner" | "intermediate" | "expert" | "all";
  availability?: "online" | "in-person" | "both" | "all";
  gender?: "male" | "female" | "all";
  languages?: string[];
  goals?: string[];
  sortBy?: "relevance" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
}

export interface SearchState {
  city: string;
  specialization: string;
  isSearching: boolean;
  error: string | null;
}

export type SearchAction =
  | { type: "SET_CITY"; payload: string }
  | { type: "SET_SPECIALIZATION"; payload: string }
  | { type: "START_SEARCH" }
  | { type: "SEARCH_SUCCESS" }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "RESET" };
