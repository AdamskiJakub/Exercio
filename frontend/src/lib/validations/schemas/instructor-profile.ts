import { z } from 'zod';

// Helper to validate comma-separated languages
const commaSeparatedStrings = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true;
    return val.split(',').every(s => s.trim().length > 0);
  },
  { message: 'Invalid format' }
);

// Helper to validate upload paths (relative /uploads/... or absolute URLs)
// Rejects empty strings to avoid empty entries in gallery arrays
const uploadPathOrUrl = z.string().refine(
  (val) => {
    // Reject empty or whitespace-only strings
    if (!val || val.trim() === '') return false;
    // Allow relative upload paths
    if (val.startsWith('/uploads/')) return true;
    // Allow absolute URLs
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid URL or upload path' }
);

export const instructorProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  hourlyRate: z.number().min(0).optional().nullable(),
  hourlyRateHidden: z.boolean().optional(),
  packageDealsEnabled: z.boolean().optional(),
  packageDealsDescription: z.string().max(500).optional(),
  // photoUrl can be null/undefined (use nullable + optional for flexibility)
  photoUrl: z.union([uploadPathOrUrl, z.literal(''), z.null()]).optional(),
  gallery: z.array(uploadPathOrUrl).optional(),
  languages: commaSeparatedStrings.optional(),
  yearsExperience: z.number().min(0).max(100).optional().nullable(),
  showPhone: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  contactMessage: z.string().max(500).optional(),
});

export type InstructorProfileFormData = z.infer<typeof instructorProfileSchema>;
