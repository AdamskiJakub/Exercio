export interface SearchFilters {
  city: string;
  specialization: string;
  tags?: string[];
  search?: string;
  type?: "all" | "instructors" | "enterprises";
}

export interface InstructorFilters extends SearchFilters {
  priceMin?: number;
  priceMax?: number;
  experience?: "0-2" | "3-5" | "6-10" | "10+" | "all";
  availability?: "online" | "in-person" | "both" | "all";
  gender?: "male" | "female" | "all";
  languages?: string[];
  goals?: string[];
  sortBy?:
    | "relevance"
    | "price-asc"
    | "price-desc"
    | "rating"
    | "most-reviewed"
    | "newest"
    | "name-asc"
    | "name-desc";
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
