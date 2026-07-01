import type { InstructorListing } from "@/types";
import type { InstructorFilters } from "@/types/filters";

export function applyClientSideFilters(
  instructors: InstructorListing[],
  filters: InstructorFilters,
): InstructorListing[] {
  let result = [...instructors];

  if (filters.search?.trim()) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter((instructor) => {
      const searchableText = [
        instructor.fullName,
        instructor.bio,
        instructor.tagline,
        instructor.user?.firstName,
        instructor.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchLower);
    });
  }

  if (filters.experience && filters.experience !== "all") {
    result = result.filter((instructor) => {
      const years = instructor.yearsExperience || 0;
      switch (filters.experience) {
        case "0-2":
          return years >= 0 && years <= 2;
        case "3-5":
          return years >= 3 && years <= 5;
        case "6-10":
          return years >= 6 && years <= 10;
        case "10+":
          return years >= 10;
        default:
          return true;
      }
    });
  }

  if (filters.availability && filters.availability !== "all") {
    result = result.filter((instructor) => {
      return instructor.availability === filters.availability;
    });
  }

  return result;
}
