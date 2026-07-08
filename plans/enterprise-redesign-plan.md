# Enterprise Redesign Plan — ✅ COMPLETED

All 5 phases have been implemented. See summary below.

## Bug: Instructor Invitation Sends Wrong ID

**Problem**: Searching for "jakub" finds the instructor, but sending invitation returns `404 Instructor profile not found`.

**Root cause**: The frontend sends `instructor.userId` (the User ID) but the backend expects `instructor.id` (the InstructorProfile ID).

**Fix**: Change [`frontend/src/app/[locale]/dashboard/enterprise/instructors/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/instructors/page.tsx:189) from:

```tsx
onClick={() => handleSendInvitation(instructor.userId)}
```

to:

```tsx
onClick={() => handleSendInvitation(instructor.id)}
```

---

## Phase 1: Quick Fixes (HIGH priority, low effort)

### 1.1 Fix text readability across all enterprise pages

**Problem**: `text-slate-500` placeholders and descriptions are illegible. Small fonts are unreadable.

**Changes**:

- Replace all `text-slate-500` with `text-slate-300` or `text-slate-400` in enterprise components
- Increase base font sizes for descriptions and placeholders (`text-sm` → `text-base`)
- Fix the profile page subtitle: "Zaktualizuj informacje o firmie widoczne dla instruktorów" → change to "widoczne dla klientów i instruktorów"

**Files affected**:

- [`frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx) — subtitle, placeholders
- [`frontend/src/app/[locale]/dashboard/enterprise/instructors/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/instructors/page.tsx) — descriptions
- [`frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx) — descriptions
- [`frontend/src/components/dashboard/EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx) — empty state texts

### 1.2 Fix public profile back button

**Problem**: "Zobacz profil publiczny" → back button says "Powrót do listingu" but user came from dashboard.

**Changes**:

- Add `?from=dashboard` query param to the public profile link in the dashboard
- In [`EnterpriseProfilePage.tsx`](frontend/src/components/enterprise/EnterpriseProfilePage.tsx), check for `from=dashboard` and show "Powrót do panelu" instead of "Powrót do listingu"

**Files affected**:

- [`frontend/src/components/dashboard/EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx) — add `?from=dashboard` to public profile link
- [`frontend/src/components/enterprise/EnterpriseProfilePage.tsx`](frontend/src/components/enterprise/EnterpriseProfilePage.tsx) — conditional back button text

### 1.3 Fix news not updating on dashboard after creation

**Problem**: After creating news, the dashboard card still shows "Brak aktualności".

**Root cause**: [`EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx:168-187) always shows the empty state for news — it never checks if `profile?.news` has items.

**Changes**:

- Update the News card in [`EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx:168) to actually render news items (similar to how instructors are rendered)
- Show last 3-5 news items with title and date

### 1.4 Fix copy: "Krótki Opis" / "instruktorom"

**Problem**:

- "Krótki tagline dla Twojej firmy" — nobody knows what a tagline is
- "Opisz swoją firmę instruktorom..." — should be for clients/everyone, not just instructors

**Changes**:

- Change placeholder: "Krótki tagline dla Twojej firmy" → "Np. Najlepsza szkoła tańca w Warszawie"
- Change description: "Opisz swoją firmę instruktorom..." → "Opisz swoją firmę — historię, ofertę, zespół..."
- Change subtitle: "widoczne dla instruktorów" → "widoczne dla klientów i instruktorów"

**Files affected**:

- [`frontend/messages/pl.json`](frontend/messages/pl.json) — update `shortDescriptionPlaceholder`, `descriptionPlaceholder`, `companyProfileDescription`
- [`frontend/messages/en.json`](frontend/messages/en.json) — same keys

---

## Phase 2: Dashboard Onboarding Checklist (HIGH priority, medium effort)

### 2.1 Add onboarding progress to dashboard

**Problem**: Dashboard is "dead" — empty cards with no sense of progress.

**Solution**: Add an onboarding checklist component at the top of the dashboard that shows:

```
✔ Uzupełnij opis firmy
✔ Dodaj logo
✔ Dodaj pierwsze zdjęcie
✔ Dodaj pierwszego instruktora
✔ Dodaj pierwszą aktualność
✔ Opublikuj profil
```

Each item checks if the corresponding field is filled. Progress bar shows % complete.

**Implementation**:

- Create [`frontend/src/components/enterprise/OnboardingChecklist.tsx`](frontend/src/components/enterprise/OnboardingChecklist.tsx) — new component
- Check: `description`, `logoUrl`, `gallery.length > 0`, `instructors.length > 0`, `news.length > 0`, `status === 'ACTIVE'`
- Show only when profile is not fully complete
- Add i18n keys for checklist items

**Files affected**:

- NEW: [`frontend/src/components/enterprise/OnboardingChecklist.tsx`](frontend/src/components/enterprise/OnboardingChecklist.tsx)
- [`frontend/src/components/dashboard/EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx) — import and render checklist
- [`frontend/messages/pl.json`](frontend/messages/pl.json) — add checklist i18n keys
- [`frontend/messages/en.json`](frontend/messages/en.json) — add checklist i18n keys

---

## Phase 3: Profile Page Redesign — Dashboard Edit Form (HIGH priority, medium effort)

### 3.1 Add cover photo field

**Problem**: No cover/banner photo. This is the single most impactful visual element.

**Changes**:

- Add `coverUrl: string | null` to Prisma schema, DTO, types
- Add cover photo upload field to profile edit form
- Show cover preview in the form

**Files affected**:

- [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) — add `coverUrl` field to `EnterpriseProfile`
- [`backend/src/enterprise/dto/update-enterprise-profile.dto.ts`](backend/src/enterprise/dto/update-enterprise-profile.dto.ts) — add `coverUrl`
- [`frontend/src/types/enterprise.ts`](frontend/src/types/enterprise.ts) — add `coverUrl` to `EnterpriseProfile` and `UpdateEnterpriseProfileDto`
- [`frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx) — add cover photo upload section
- [`frontend/messages/*.json`](frontend/messages/*.json) — add i18n keys

### 3.2 Add gallery section to profile form

**Problem**: Gallery exists in the data model but isn't exposed in the profile edit form.

**Changes**:

- Add gallery management UI (add/remove images) to the profile form
- Use existing `gallery: string[]` field (URLs)

**Files affected**:

- [`frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx) — add gallery section
- [`frontend/messages/*.json`](frontend/messages/*.json) — add gallery i18n keys

### 3.3 Add opening hours

**Problem**: No opening hours field. Must-have for any physical business.

**Changes**:

- Add `openingHours: Json?` to Prisma schema (JSON object like `{ "monday": "9:00-21:00", ... }`)
- Add to DTO and types
- Add UI for setting hours (simple text inputs per day)

**Files affected**:

- [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) — add `openingHours` field
- [`backend/src/enterprise/dto/update-enterprise-profile.dto.ts`](backend/src/enterprise/dto/update-enterprise-profile.dto.ts) — add `openingHours`
- [`frontend/src/types/enterprise.ts`](frontend/src/types/enterprise.ts) — add `openingHours`
- [`frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx) — add hours section
- [`frontend/messages/*.json`](frontend/messages/*.json) — add hours i18n keys

### 3.4 Add Google Maps link (auto-generated)

**Problem**: No location/map link.

**Changes**:

- Generate Google Maps link from city + address: `https://www.google.com/maps/search/?api=1&query={address}+{city}`
- Show "Otwórz w Google Maps" button on public profile

**Files affected**:

- [`frontend/src/components/enterprise/EnterpriseProfilePage.tsx`](frontend/src/components/enterprise/EnterpriseProfilePage.tsx) — add Google Maps link
- No backend changes needed (generated from address+city)

### 3.5 Add highlight/stats fields

**Problem**: No way to show "Od 2017", "1200 kursantów", "18 instruktorów", "4 sale".

**Changes**:

- Add `highlights: Json[]` to Prisma schema (array of `{ label: string, value: string }`)
- Add to DTO and types
- Add UI in profile form
- Display on public profile

**Files affected**:

- [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) — add `highlights` field
- [`backend/src/enterprise/dto/update-enterprise-profile.dto.ts`](backend/src/enterprise/dto/update-enterprise-profile.dto.ts) — add `highlights`
- [`frontend/src/types/enterprise.ts`](frontend/src/types/enterprise.ts) — add `highlights`
- [`frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx) — add highlights section
- [`frontend/src/components/enterprise/EnterpriseProfilePage.tsx`](frontend/src/components/enterprise/EnterpriseProfilePage.tsx) — display highlights
- [`frontend/messages/*.json`](frontend/messages/*.json) — add i18n keys

---

## Phase 4: News/Aktualności Redesign (MEDIUM priority, high effort)

### 4.1 Rename "Aktualności" to "Co nowego" or "Ogłoszenia"

**Problem**: "Aktualności" sounds too formal/administrative.

**Changes**:

- Update i18n keys: `newsManagement` → `whatsNew` or `announcements`
- Update all references in the UI

**Files affected**:

- [`frontend/messages/pl.json`](frontend/messages/pl.json) — rename keys
- [`frontend/messages/en.json`](frontend/messages/en.json) — rename keys
- [`frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx) — update references
- [`frontend/src/components/dashboard/EnterpriseDashboard.tsx`](frontend/src/components/dashboard/EnterpriseDashboard.tsx) — update references

### 4.2 Add link preview (Open Graph) support

**Problem**: Current news is just title + URL + description. No auto-preview.

**Changes**:

- Create a backend endpoint or service that fetches Open Graph data from a URL
- When creating news with a URL, auto-fetch `og:title`, `og:description`, `og:image`, `favicon`
- Store these in the existing `title`, `description`, `thumbnailUrl` fields
- Add fallback: if OG fails, show domain name + "Brak miniatury"

**Files affected**:

- NEW: [`backend/src/enterprise/enterprise-og.service.ts`](backend/src/enterprise/enterprise-og.service.ts) — Open Graph fetcher
- [`backend/src/enterprise/enterprise-news.service.ts`](backend/src/enterprise/enterprise-news.service.ts) — integrate OG fetch on create
- [`backend/package.json`](backend/package.json) — add `open-graph-scraper` or `node-html-parser` dependency
- NEW: [`frontend/src/components/enterprise/EnterpriseNewsCard.tsx`](frontend/src/components/enterprise/EnterpriseNewsCard.tsx) — news display with preview

### 4.3 Add "normal post" type (no external link)

**Problem**: Sometimes you just want to post text + image without an external link.

**Changes**:

- Add `type` field to `EnterpriseNews`: `LINK` | `POST`
- For `POST` type: show title, description, optional image upload
- For `LINK` type: show OG preview (current behavior)

**Files affected**:

- [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) — add `type` field to `EnterpriseNews`
- [`backend/src/enterprise/dto/create-enterprise-news.dto.ts`](backend/src/enterprise/dto/create-enterprise-news.dto.ts) — add `type`
- [`frontend/src/types/enterprise.ts`](frontend/src/types/enterprise.ts) — add `type` to `EnterpriseNews`
- [`frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx`](frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx) — add post type toggle

---

## Phase 5: Public Profile Redesign (MEDIUM priority, high effort)

### 5.1 Redesign public profile page

**Problem**: Public profile is bare — just name, description, contact links.

**Changes**:

- Add cover photo as hero background
- Show logo overlay on cover
- Display highlights/stats row
- Show gallery grid
- Show opening hours
- Show Google Maps link
- Show instructor team grid
- Show news/announcements section
- Show amenities as badges

**Files affected**:

- [`frontend/src/components/enterprise/EnterpriseProfilePage.tsx`](frontend/src/components/enterprise/EnterpriseProfilePage.tsx) — major redesign
- NEW: [`frontend/src/components/enterprise/EnterpriseHero.tsx`](frontend/src/components/enterprise/EnterpriseHero.tsx) — hero with cover + logo

---

## Implementation Order

```
Phase 0: Bug Fix (NOW)
└── Fix instructor invitation sending wrong ID (userId vs instructorId)

Phase 1: Quick Fixes (HIGH priority, low effort)
├── 1.1 Fix text readability (text-slate-500 → text-slate-300/400)
├── 1.2 Fix public profile back button
├── 1.3 Fix news not updating on dashboard
└── 1.4 Fix copy (Krótki Opis, instruktorom → klientom)

Phase 2: Dashboard Onboarding (HIGH priority, medium effort)
└── 2.1 Add onboarding checklist component

Phase 3: Profile Form Enhancements (HIGH priority, medium effort)
├── 3.1 Add cover photo field
├── 3.2 Add gallery section to form
├── 3.3 Add opening hours
├── 3.4 Add Google Maps link
└── 3.5 Add highlight/stats fields

Phase 4: News Redesign (MEDIUM priority, high effort)
├── 4.1 Rename "Aktualności" → "Co nowego"
├── 4.2 Add Open Graph link preview
└── 4.3 Add normal post type

Phase 5: Public Profile Redesign (MEDIUM priority, high effort)
└── 5.1 Redesign public profile with cover, gallery, hours, highlights
```

---

## Prisma Schema Changes Required

```prisma
model EnterpriseProfile {
  // ... existing fields ...
  coverUrl        String?            // NEW: cover/banner photo
  openingHours    Json?              // NEW: JSON object for hours
  highlights      Json?              // NEW: array of {label, value} objects
  // ... rest unchanged ...
}

model EnterpriseNews {
  // ... existing fields ...
  type            String?   @default("LINK")  // NEW: "LINK" | "POST"
  // ... rest unchanged ...
}
```

## Migration Strategy

1. Each Prisma change needs a new migration file
2. Backend DTOs need corresponding new fields
3. Frontend types need updating
4. Frontend forms need new sections
5. All new UI strings need i18n keys in both pl.json and en.json

## Files to Create

| File                                                         | Purpose                               |
| ------------------------------------------------------------ | ------------------------------------- |
| `frontend/src/components/enterprise/OnboardingChecklist.tsx` | Dashboard onboarding progress         |
| `frontend/src/components/enterprise/EnterpriseHero.tsx`      | Public profile hero with cover + logo |
| `frontend/src/components/enterprise/EnterpriseNewsCard.tsx`  | News display with OG preview          |
| `backend/src/enterprise/enterprise-og.service.ts`            | Open Graph metadata fetcher           |

## Files to Modify

| File                                                                  | Changes                                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `backend/prisma/schema.prisma`                                        | Add `coverUrl`, `openingHours`, `highlights` to EnterpriseProfile; add `type` to EnterpriseNews |
| `backend/src/enterprise/dto/update-enterprise-profile.dto.ts`         | Add new fields                                                                                  |
| `backend/src/enterprise/dto/create-enterprise-news.dto.ts`            | Add `type` field                                                                                |
| `backend/src/enterprise/enterprise-news.service.ts`                   | Integrate OG fetch                                                                              |
| `frontend/src/types/enterprise.ts`                                    | Add new fields to interfaces                                                                    |
| `frontend/src/components/dashboard/EnterpriseDashboard.tsx`           | Add checklist, fix news display                                                                 |
| `frontend/src/components/enterprise/EnterpriseProfilePage.tsx`        | Major redesign                                                                                  |
| `frontend/src/app/[locale]/dashboard/enterprise/profile/page.tsx`     | Add cover, gallery, hours, highlights sections                                                  |
| `frontend/src/app/[locale]/dashboard/enterprise/news/page.tsx`        | Add post type toggle                                                                            |
| `frontend/src/app/[locale]/dashboard/enterprise/instructors/page.tsx` | Fix: send `instructor.id` not `instructor.userId`                                               |
| `frontend/messages/pl.json`                                           | All new i18n keys                                                                               |
| `frontend/messages/en.json`                                           | All new i18n keys                                                                               |
