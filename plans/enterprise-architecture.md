# Enterprise Architecture — Trainly

> **Status**: Design document (Updated 2026-07-05)
> **Cel**: Pełna architektura systemu Enterprise (organizacji/partnerów)
> **Zasada**: Enterprise JEST rolą użytkownika — `UserRole.ENTERPRISE` z 1:1 do `EnterpriseProfile`

---

## Spis treści

1. [Założenia architektoniczne](#1-założenia-architektoniczne)
2. [Modele danych (Prisma)](#2-modele-danych-prisma)
3. [Relacje między modelami](#3-relacje-między-modelami)
4. [Rejestracja i onboarding Enterprise](#4-rejestracja-i-onboarding-enterprise)
5. [System zaproszeń (Enterprise → Instructor)](#5-system-zaproszeń-enterprise--instructor)
6. [Dashboard Enterprise](#6-dashboard-enterprise)
7. [Profil publiczny Enterprise](#7-profil-publiczny-enterprise)
8. [Wyszukiwarka — unified search](#8-wyszukiwarka--unified-search)
9. [Opinie — agregacja](#9-opinie--agregacja)
10. [Monetyzacja / Subskrypcje](#10-monetyzacja--subskrypcje)
11. [Plikowa struktura projektu](#11-plikowa-struktura-projektu)
12. [Kolejność implementacji](#12-kolejność-implementacji)

---

## 1. Założenia architektoniczne

### Kluczowe decyzje

| Decyzja                                                           | Uzasadnienie                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Enterprise = UserRole.ENTERPRISE**                              | Dodajemy `ENTERPRISE` do `UserRole`. Enterprise to osobne konto z dedykowaną rejestracją.    |
| **EnterpriseProfile 1:1 z User**                                  | Każde konto Enterprise ma jeden profil firmowy. User jest właścicielem.                      |
| **Rejestracja → formularz → lead → akceptacja admina → płatność** | Brak self-service. Admin Trainly ręcznie akceptuje leady. Płatność po akceptacji (Option B). |
| **Instruktorzy przypisani przez zaproszenie**                     | Relacja M:N przez `EnterpriseInstructor`. Instruktor musi zaakceptować.                      |
| **Brak OAuth dla Enterprise**                                     | Enterprise rejestruje się tylko przez formularz zgłoszeniowy.                                |
| **Opinie = średnia instruktorów**                                 | Enterprise nie ma własnych opinii. Pokazuje zagregowaną średnią przypisanych instruktorów.   |
| **Jedna wyszukiwarka**                                            | Ten sam search, ale z filtrem "Typ: Instruktorzy / Partnerzy".                               |
| **Enterprise płatne**                                             | Subskrypcja (Stripe/Paddle). Na start: miesięczna.                                           |

### Czego Enterprise NIE ma

- ❌ Kalendarza / slotów / availability
- ❌ Bookingów (nie prowadzi sesji)
- ❌ Usług / serwisów
- ❌ Własnych opinii
- ❌ OAuth przy rejestracji

---

## 2. Modele danych (Prisma)

### 2.1 `EnterpriseProfile`

Główny model organizacji. **1:1 z User** — user.role = `ENTERPRISE`.

```prisma
enum EnterpriseCategory {
  DANCE_SCHOOL
  GYM
  FITNESS_CLUB
  YOGA_STUDIO
  PILATES_STUDIO
  MARTIAL_ARTS
  SWIMMING_POOL
  PERSONAL_TRAINING_STUDIO
  SPORTS_CENTER
  OTHER
}

enum EnterpriseStatus {
  PENDING    // oczekuje na akceptację admina
  ACTIVE     // zaakceptowany, konto działa
  SUSPENDED  // zawieszony (np. brak płatności)
  REJECTED   // odrzucony
}

model EnterpriseProfile {
  id              String             @id @default(uuid())

  // User (właściciel) — 1:1, wymagany
  userId          String             @unique
  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Status
  status          EnterpriseStatus   @default(PENDING)
  verified        Boolean            @default(false)

  // Podstawowe dane firmy
  companyName     String
  slug            String             @unique           // np. "feniks-studio-tanca"
  shortDescription String?
  description     String?
  email           String?
  phone           String?
  website         String?
  logoUrl         String?

  // Social Media
  facebookUrl     String?
  instagramUrl    String?
  youtubeUrl      String?
  tiktokUrl       String?

  // Lokalizacja
  city            String?
  address         String?
  postalCode      String?

  // Kategoryzacja
  category        EnterpriseCategory @default(OTHER)
  tags            String[]                             // np. ["salsa", "bachata", "hip-hop"]

  // Udogodnienia
  amenities       String[]                             // np. ["parking", "showers", "wifi", "ac", "cafe"]

  // Media
  gallery         String[]                             // URLs zdjęć
  videos          String[]                             // URLs filmów

  // Partnerzy / certyfikaty
  partners        String[]                             // np. ["Nike", "Reebok"]
  certificates    String[]                             // np. ["PZT", "AWF"]

  // Subskrypcja
  subscriptionId  String?                              // ID subskrypcji w Stripe/Paddle
  subscriptionStatus String? @default("incomplete")    // "incomplete" | "active" | "past_due" | "canceled"
  subscribedAt    DateTime?
  subscriptionExpiresAt DateTime?

  // Daty
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relacje
  instructors     EnterpriseInstructor[]
  news            EnterpriseNews[]

  @@index([status])
  @@index([city])
  @@index([category])
  @@index([slug])
  @@map("enterprise_profiles")
}
```

### 2.2 `EnterpriseInstructor` (łącznik)

```prisma
enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  REMOVED
}

model EnterpriseInstructor {
  id              String            @id @default(uuid())

  enterpriseId    String
  instructorId    String            // InstructorProfile.id

  status          InvitationStatus  @default(PENDING)
  role            String?           // np. "główny trener", "instruktor prowadzący"

  invitedAt       DateTime          @default(now())
  acceptedAt      DateTime?
  rejectedAt      DateTime?
  removedAt       DateTime?

  // Relacje
  enterprise      EnterpriseProfile @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  instructor      InstructorProfile @relation(fields: [instructorId], references: [id], onDelete: Cascade)

  @@unique([enterpriseId, instructorId])
  @@index([enterpriseId])
  @@index([instructorId])
  @@index([status])
  @@map("enterprise_instructors")
}
```

### 2.3 `EnterpriseNews`

```prisma
model EnterpriseNews {
  id              String            @id @default(uuid())

  enterpriseId    String
  url             String            // Link do Facebook/Instagram/YouTube/TikTok
  title           String?           // Optional — może być wyciągnięty z OG tags
  description     String?           // Optional
  thumbnailUrl    String?           // Optional — OG image
  platform        String?           // "facebook" | "instagram" | "youtube" | "tiktok" | "other"

  createdAt       DateTime          @default(now())

  // Relacje
  enterprise      EnterpriseProfile @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)

  @@index([enterpriseId])
  @@map("enterprise_news")
}
```

### 2.4 `EnterpriseLead` (zgłoszenia przed akceptacją)

```prisma
model EnterpriseLead {
  id              String            @id @default(uuid())

  // Dane z formularza
  companyName     String
  city            String?
  email           String
  phone           String?
  website         String?
  message         String?           // Dodatkowa wiadomość

  // Status
  status          String            @default("new")   // "new" | "contacted" | "approved" | "rejected"
  notes           String?           // Notatki admina

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([status])
  @@map("enterprise_leads")
}
```

### 2.5 Modyfikacje istniejących modeli

#### `InstructorProfile` — dodaj relację do EnterpriseInstructor

```prisma
model InstructorProfile {
  // ... existing fields ...

  enterpriseMemberships EnterpriseInstructor[]

  // ... existing relations ...
}
```

#### `User` — dodaj `role: ENTERPRISE` + relację do EnterpriseProfile

```prisma
enum UserRole {
  CLIENT
  INSTRUCTOR
  ADMIN
  ENTERPRISE    // ← NOWY
}

model User {
  // ... existing fields ...

  enterpriseProfile EnterpriseProfile?  // 1:1, jeśli user jest Enterprise

  // ... existing relations ...
}
```

#### `NotificationType` — dodaj nowe typy

```prisma
enum NotificationType {
  FAVORITE
  NEW_BOOKING
  NEW_REVIEW
  BOOKING_CANCELLED
  ENTERPRISE_INVITATION       // nowy
  ENTERPRISE_INVITATION_ACCEPTED  // nowy
}
```

---

## 3. Relacje między modelami

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
│  (CLIENT | INSTRUCTOR | ADMIN | ENTERPRISE)                 │
│  ↑ enterpriseProfile (1:1, jeśli role = ENTERPRISE)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 1:1 (obowiązkowa dla ENTERPRISE)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EnterpriseProfile                         │
│  - userId → User (wymagany, unique)                         │
│  - status: PENDING | ACTIVE | SUSPENDED | REJECTED          │
│  - subscriptionStatus                                       │
└──┬──────────────────────────────────────┬───────────────────┘
   │                                      │
   │ 1:N (EnterpriseInstructor)           │ 1:N (EnterpriseNews)
   ▼                                      ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   EnterpriseInstructor   │    │     EnterpriseNews        │
│  - enterpriseId          │    │  - enterpriseId          │
│  - instructorId          │    │  - url                   │
│  - status: PENDING       │    │  - platform              │
│            ACCEPTED      │    └──────────────────────────┘
│            REJECTED      │
│            REMOVED       │
└──────────┬───────────────┘
           │
           │ M:1 (InstructorProfile)
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    InstructorProfile                         │
│  (istniejący model, bez zmian)                              │
│  + enterpriseMemberships EnterpriseInstructor[]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Rejestracja i onboarding Enterprise

### 4.1 Flow

```
1. Użytkownik klika "Dołącz jako partner" (na stronie głównej lub w dashboardcie)
   │
2. Formularz zgłoszeniowy
   │  - Nazwa firmy (required)
   │  - Miasto
   │  - Email (required) — to będzie email konta Enterprise
   │  - Telefon
   │  - WWW
   │  - Wiadomość (optional)
   │
3. Klik "Wyślij zgłoszenie"
   │
4. Backend: tworzy EnterpriseLead (status: "new")
   │  - Wysyła email do admina Trainly z powiadomieniem
   │
5. Admin Trainly (Ty):
   │  - Otrzymujesz powiadomienie / email
   │  - Logujesz się do panelu admina
   │  - Widzisz listę leadów
   │  - Klikasz "Akceptuj" → backend:
   │    a) Tworzy User z role: ENTERPRISE (email z leada, hasło tymczasowe)
   │    b) Tworzy EnterpriseProfile z userId → User
   │    c) Wysyła email do firmy z linkiem do ustawienia hasła + dashboardu
   │  - Klikasz "Odrzuć" → status: REJECTED
   │
6. Po akceptacji:
   │  - Firma dostaje email z linkiem do aktywacji konta
   │  - Ustawia hasło, loguje się
   │  - Widzi onboarding: wybór planu → płatność → dashboard
   │  - EnterpriseProfile.status = ACTIVE po opłaceniu subskrypcji
```

### 4.2 Formularz zgłoszeniowy — komponent

```
frontend/src/app/[locale]/enterprise/apply/page.tsx
  → EnterpriseApplyForm (formularz)
  → useEnterpriseApply (hook → POST /enterprise/apply)
```

### 4.3 Backend endpointy

| Metoda  | Endpoint                              | Opis                                             |
| ------- | ------------------------------------- | ------------------------------------------------ |
| `POST`  | `/enterprise/apply`                   | Zgłoszenie nowej firmy (tworzy `EnterpriseLead`) |
| `GET`   | `/admin/enterprise/leads`             | Lista leadów (dla admina Trainly)                |
| `PATCH` | `/admin/enterprise/leads/:id/approve` | Akceptacja leada → tworzy `EnterpriseProfile`    |
| `PATCH` | `/admin/enterprise/leads/:id/reject`  | Odrzucenie leada                                 |

### 4.4 Rejestracja — zmiany w `/register`

Na stronie wyboru roli (`/register`) dodajemy trzecią kartę:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐
│   Klient    │  │ Instruktor  │  │ Dołącz jako Partner  │
│  Darmowe    │  │  Darmowe    │  │  Premium — płatne    │
│             │  │             │  │                      │
│ [Wybierz]   │  │ [Wybierz]   │  │ [Wypełnij formularz] │
└─────────────┘  └─────────────┘  └─────────────────────┘
```

Karta "Dołącz jako Partner" → link do `/enterprise/apply` (nie do standardowej rejestracji).
Enterprise NIE ma OAuth — tylko formularz zgłoszeniowy.

---

## 5. System zaproszeń (Enterprise → Instructor)

### 5.1 Flow

```
Enterprise Dashboard
  → "Nasi instruktorzy"
  → "Dodaj instruktora"
  → Wyszukiwarka instruktorów (po nazwie, username, email)
  → Wybierz instruktora
  → "Wyślij zaproszenie"

Instruktor otrzymuje:
  → Powiadomienie (Notification type: ENTERPRISE_INVITATION)
  → Email (opcjonalnie)
  → W dashboardcie: "Zaproszenia od partnerów"

Instruktor:
  → [Akceptuj] → EnterpriseInstructor.status = ACCEPTED
  → [Odrzuć] → EnterpriseInstructor.status = REJECTED

Po akceptacji:
  → Instruktor pojawia się na profilu Enterprise
  → Enterprise dostaje powiadomienie (ENTERPRISE_INVITATION_ACCEPTED)
```

### 5.2 Backend endpointy

| Metoda   | Endpoint                                    | Auth             | Opis                               |
| -------- | ------------------------------------------- | ---------------- | ---------------------------------- |
| `POST`   | `/enterprise/:id/invitations`               | Enterprise admin | Wyślij zaproszenie                 |
| `GET`    | `/enterprise/:id/instructors`               | Public           | Lista zaakceptowanych instruktorów |
| `GET`    | `/me/enterprise-invitations`                | Instructor       | Moje zaproszenia                   |
| `PATCH`  | `/enterprise-invitations/:id/accept`        | Instructor       | Akceptuj                           |
| `PATCH`  | `/enterprise-invitations/:id/reject`        | Instructor       | Odrzuć                             |
| `DELETE` | `/enterprise/:id/instructors/:instructorId` | Enterprise admin | Usuń instruktora                   |

### 5.3 Wyszukiwarka instruktorów (dla Enterprise)

Endpoint do wyszukiwania instruktorów przy zapraszaniu:

```
GET /enterprise/search-instructors?q=jakub&city=białystok
```

Zwraca listę `InstructorProfile` z podstawowymi danymi (bez wrażliwych). Wyniki wykluczają już zaproszonych/zaakceptowanych instruktorów.

---

## 6. Dashboard Enterprise

### 6.1 Struktura

```
/dashboard/enterprise
  ├── page.tsx                    → Główny dashboard (statystyki)
  ├── profile/page.tsx            → Edycja profilu Enterprise
  ├── instructors/page.tsx        → Zarządzanie instruktorami
  ├── news/page.tsx               → Zarządzanie aktualnościami
  └── settings/page.tsx           → Ustawienia + subskrypcja
```

### 6.2 Główny dashboard

```
┌─────────────────────────────────────────────────┐
│  Witaj, [Nazwa Firmy]                           │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 15       │  │ 4.92 ★   │  │ 386      │      │
│  │Instruktorów│  │Średnia  │  │Opinii    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                 │
│  [Edytuj profil]  [Zaproś instruktora]          │
│                                                 │
│  ── Ostatnie aktualności ──                     │
│  • Weekend Bachata — dodany 2 dni temu          │
│  • Nowy kurs Salsy — dodany 5 dni temu          │
│                                                 │
│  ── Status subskrypcji ──                       │
│  ✅ Aktywna — od lipca 2026                     │
│  [Zarządzaj subskrypcją]                        │
└─────────────────────────────────────────────────┘
```

### 6.3 Sekcja "Nasi instruktorzy" (dla Enterprise admina)

```
┌─────────────────────────────────────────────────┐
│  Nasi instruktorzy                    [Dodaj]   │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ [zdjęcie]    │  │ [zdjęcie]    │             │
│  │ Anna         │  │ Michał       │             │
│  │ Główny trener│  │ Instruktor   │             │
│  │ ⭐ 4.9       │  │ ⭐ 4.7       │             │
│  │ [Usuń]       │  │ [Usuń]       │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ── Oczekujące zaproszenia ──                   │
│  • Jakub — wysłane 2 dni temu [Odwołaj]         │
└─────────────────────────────────────────────────┘
```

---

## 7. Profil publiczny Enterprise

### 7.1 URL

```
/{locale}/enterprise/{slug}
```

Np. `/pl/partner/feniks-studio-tanca`

### 7.2 Layout

```
┌──────────────────────────────────────────────────────┐
│  [Cover / zdjęcie główne]                            │
│                                                      │
│  [Logo]  Nazwa firmy                    ★ 4.92       │
│          Kategoria: Szkoła Tańca        386 opinii    │
│          📍 Białystok                                │
│                                                      │
│  ── O nas ──                                         │
│  [opis firmy]                                        │
│                                                      │
│  ── Udogodnienia ──                                  │
│  🅿 Parking  🚿 Prysznic  👕 Szatnia  📶 WiFi       │
│                                                      │
│  ── Nasi instruktorzy ──                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Anna  │ │Michał│ │Jakub │ │Natalia│               │
│  │4.9 ★ │ │4.7 ★ │ │5.0 ★ │ │4.8 ★ │               │
│  │[Profil]│ │[Profil]│ │[Profil]│ │[Profil]│        │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  ── Galeria ──                                       │
│  [zdjęcia] [zdjęcia] [zdjęcia] [więcej]             │
│                                                      │
│  ── Aktualności ──                                   │
│  ┌──────────────────────────────────────┐           │
│  │  Weekend Bachata                     │           │
│  │  sobota 20:00                        │           │
│  │  [facebook-icon] → fb.me/event/123   │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  ── Lokalizacja ──                                   │
│  ul. Przykładowa 1, 15-001 Białystok                │
│  [Otwórz w Google Maps →]                           │
│                                                      │
│  ── Kontakt ──                                       │
│  ✉ kontakt@firma.pl  📞 +48 123 456 789             │
│  🌐 www.firma.pl                                     │
│                                                      │
│  Social: [FB] [IG] [YT] [TT]                        │
└──────────────────────────────────────────────────────┘
```

### 7.3 Komponenty frontendowe

```
frontend/src/components/enterprise/
  ├── EnterpriseProfilePage.tsx       → Główna strona profilu
  ├── EnterpriseHeader.tsx            → Cover + logo + podstawowe info
  ├── EnterpriseInstructors.tsx       → Sekcja "Nasi instruktorzy"
  ├── EnterpriseInstructorCard.tsx    → Karta instruktora
  ├── EnterpriseGallery.tsx           → Galeria zdjęć/filmów
  ├── EnterpriseNews.tsx              → Sekcja aktualności
  ├── EnterpriseNewsCard.tsx          → Karta aktualności (link preview)
  ├── EnterpriseLocation.tsx          → Lokalizacja + Google Maps link
  ├── EnterpriseContact.tsx           → Kontakt + social media
  ├── EnterpriseAmenities.tsx         → Udogodnienia
  └── EnterpriseRating.tsx            → Średnia ocen instruktorów
```

---

## 8. Wyszukiwarka — unified search

### 8.1 Założenia

- **Jedna wyszukiwarka** — nie ma osobnej zakładki "Partnerzy"
- **Wyniki mieszane** — instruktorzy i enterprise w jednej liście
- **Filtr "Typ"** — checkboxy: `☑ Instruktorzy  ☑ Partnerzy` (domyślnie oba)
- **Placeholder** zmieniony z "Szukaj po nazwisku..." na "Szukaj instruktora, szkoły tańca, siłowni..."

### 8.2 Backend — nowy endpoint search

```
GET /search?q=salsa&city=białystok&type=all&page=1&limit=20
```

Zwraca:

```json
{
  "instructors": {
    "data": [...],
    "total": 5
  },
  "enterprises": {
    "data": [...],
    "total": 2
  }
}
```

Gdy `type=instructors` → tylko `instructors.data`  
Gdy `type=enterprises` → tylko `enterprises.data`  
Gdy `type=all` → oba

### 8.3 Wyszukiwanie po stronie Enterprise

Pola przeszukiwane dla Enterprise:

- `companyName`
- `description`
- `shortDescription`
- `city`
- `tags`
- `category` (nazwa kategorii)

### 8.4 Filtry boczne

Obecny [`FiltersSidebar`](frontend/src/components/instructors/filters-sidebar.tsx) rozszerzamy:

```
Typ wyniku
  ☑ Instruktorzy
  ☑ Partnerzy

[Jeśli wybrani Instruktorzy — obecne filtry]
  Specjalizacja
  Cena
  Doświadczenie
  Tagi
  Cele

[Jeśli wybrani Partnerzy — filtry Enterprise]
  Kategoria (DANCE_SCHOOL, GYM, ...)
  Miasto
  Tagi
  Udogodnienia
  Tylko zweryfikowani
```

Gdy zaznaczone oba — filtry się łączą (wszystkie widoczne).

### 8.5 Karta wyniku Enterprise

Różni się od karty instruktora:

```
┌────────────────────────────────────────┐
│  🏢  Feniks Studio Tańca              │
│  ⭐ 4.92  (386 opinii)                 │
│  📍 Białystok                          │
│  Szkoła Tańca • Salsa • Bachata        │
│  [Zobacz profil]                       │
└────────────────────────────────────────┘
```

### 8.6 Modyfikacje istniejących plików

| Plik                                                                                                                                     | Zmiana                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`frontend/src/types/filters.ts`](frontend/src/types/filters.ts)                                                                         | Dodać `type?: "all" \| "instructors" \| "enterprises"` do `SearchFilters`     |
| [`frontend/src/hooks/useInstructors.ts`](frontend/src/hooks/useInstructors.ts)                                                           | Rozszerzyć na `useSearch` — query do `/search` zamiast `/instructor-profiles` |
| [`frontend/src/components/instructors/filters-sidebar.tsx`](frontend/src/components/instructors/filters-sidebar.tsx)                     | Dodać sekcję "Typ wyniku" + warunkowe filtry                                  |
| [`frontend/src/components/instructors/results-section.tsx`](frontend/src/components/instructors/results-section.tsx)                     | Renderować oba typy kart                                                      |
| [`backend/src/instructor-profiles/instructor-profiles.controller.ts`](backend/src/instructor-profiles/instructor-profiles.controller.ts) | Dodać nowy kontroler `SearchController` lub rozszerzyć istniejący             |

---

## 9. Opinie — agregacja

### 9.1 Jak działa

Enterprise **nie ma własnych opinii**. Zamiast tego:

1. Każdy instruktor przypisany do Enterprise ma swoje opinie (z bookingów)
2. Profil Enterprise pokazuje **średnią ważoną** wszystkich instruktorów
3. Obliczane na backendzie, cache'owane

### 9.2 Backend — agregacja

```typescript
// EnterpriseService.getRating()
async function getEnterpriseRating(enterpriseId: string) {
  const instructors = await prisma.enterpriseInstructor.findMany({
    where: { enterpriseId, status: "ACCEPTED" },
    include: {
      instructor: {
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const allRatings = instructors.flatMap((ei) =>
    ei.instructor.reviews.map((r) => r.rating),
  );

  if (allRatings.length === 0) return null;

  return {
    average: allRatings.reduce((a, b) => a + b, 0) / allRatings.length,
    total: allRatings.length,
  };
}
```

### 9.3 Wyświetlanie

```
★ 4.92
Średnia ocen instruktorów współpracujących z tą organizacją
Na podstawie 386 opinii
```

---

## 10. Monetyzacja / Subskrypcje

### 10.1 Model

| Plan                   | Cena         | Okres      | Co zawiera                                                                        |
| ---------------------- | ------------ | ---------- | --------------------------------------------------------------------------------- |
| **Enterprise Basic**   | 49 zł / msc  | Miesięczny | Profil firmy, do 5 instruktorów, galeria, aktualności                             |
| **Enterprise Plus**    | 99 zł / msc  | Miesięczny | Wszystko z Basic + do 20 instruktorów, priorytet w wyszukiwarce, statystyki       |
| **Enterprise Premium** | 199 zł / msc | Miesięczny | Wszystko z Plus + nieograniczeni instruktorzy, verified badge, dedykowany support |

### 10.2 Płatności — integracja

Na start: **Stripe** lub **Paddle** (Paddle ma lepsze wsparcie dla EU VAT).

Flow:

1. Admin akceptuje lead → tworzy `EnterpriseProfile` z `subscriptionStatus: "incomplete"`
2. Enterprise dostaje link do payment checkout
3. Po zapłaceniu → webhook Stripe/Paddle → `subscriptionStatus: "active"`
4. Cykliczne płatności → webhook obsługuje `invoice.paid`, `subscription.canceled`

### 10.3 Backend — subscription readiness

```prisma
model EnterpriseSubscription {
  id              String   @id @default(uuid())
  enterpriseId    String   @unique
  provider        String   // "stripe" | "paddle"
  providerSubscriptionId String
  providerPriceId String
  plan            String   // "basic" | "plus" | "premium"
  status          String   // "active" | "past_due" | "canceled" | "incomplete"
  currentPeriodStart DateTime?
  currentPeriodEnd DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  enterprise      EnterpriseProfile @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)

  @@map("enterprise_subscriptions")
}
```

---

## 11. Plikowa struktura projektu

### 11.1 Backend (nowe pliki)

```
backend/src/enterprise/
  ├── enterprise.module.ts
  ├── enterprise.controller.ts        → CRUD EnterpriseProfile
  ├── enterprise.service.ts
  ├── enterprise-leads.controller.ts  → Zarządzanie leadami (admin)
  ├── enterprise-leads.service.ts
  ├── enterprise-invitations.controller.ts  → Zaproszenia
  ├── enterprise-invitations.service.ts
  ├── dto/
  │   ├── create-enterprise-lead.dto.ts
  │   ├── approve-lead.dto.ts
  │   ├── create-invitation.dto.ts
  │   ├── update-enterprise-profile.dto.ts
  │   └── search-enterprises.dto.ts
  └── types/
      └── enterprise.types.ts

backend/src/search/
  ├── search.module.ts
  ├── search.controller.ts            → GET /search
  └── search.service.ts               → Unified search (instructors + enterprises)
```

### 11.2 Frontend (nowe pliki)

```
frontend/src/app/[locale]/enterprise/
  ├── apply/page.tsx                  → Formularz zgłoszeniowy
  └── [slug]/page.tsx                 → Profil publiczny Enterprise

frontend/src/app/[locale]/dashboard/enterprise/
  ├── page.tsx                        → Dashboard Enterprise
  ├── profile/page.tsx                → Edycja profilu
  ├── instructors/page.tsx            → Zarządzanie instruktorami
  ├── news/page.tsx                   → Zarządzanie aktualnościami
  └── settings/page.tsx               → Ustawienia + subskrypcja

frontend/src/components/enterprise/
  ├── EnterpriseApplyForm.tsx         → Formularz zgłoszeniowy
  ├── EnterpriseProfilePage.tsx       → Profil publiczny
  ├── EnterpriseHeader.tsx
  ├── EnterpriseInstructors.tsx
  ├── EnterpriseInstructorCard.tsx
  ├── EnterpriseGallery.tsx
  ├── EnterpriseNews.tsx
  ├── EnterpriseNewsCard.tsx
  ├── EnterpriseLocation.tsx
  ├── EnterpriseContact.tsx
  ├── EnterpriseAmenities.tsx
  ├── EnterpriseRating.tsx
  ├── EnterpriseDashboard.tsx         → Dashboard główny
  ├── EnterpriseProfileForm.tsx       → Formularz edycji profilu
  ├── EnterpriseInstructorManager.tsx → Zarządzanie instruktorami
  ├── EnterpriseNewsManager.tsx       → Zarządzanie aktualnościami
  └── EnterpriseSettings.tsx          → Ustawienia

frontend/src/hooks/
  ├── useEnterpriseApply.ts           → Hook do zgłoszenia
  ├── useEnterpriseProfile.ts         → Hook do profilu publicznego
  ├── useEnterpriseDashboard.ts       → Hook do dashboardu
  ├── useEnterpriseInstructors.ts     → Hook do zarządzania instruktorami
  ├── useEnterpriseInvitations.ts     → Hook do zaproszeń
  └── useSearch.ts                    → Rozszerzony hook wyszukiwania

frontend/src/types/
  ├── enterprise.ts                   → Typy Enterprise
  └── filters.ts                      → Rozszerzone filtry (dodać type)
```

### 11.3 Modyfikacje istniejących plików

| Plik                                                                                                                 | Zmiana                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)                                                       | Dodać 4 nowe modele + enumy + modyfikacje `User`, `InstructorProfile`, `NotificationType` |
| [`backend/src/app.module.ts`](backend/src/app.module.ts)                                                             | Dodać `EnterpriseModule`, `SearchModule`                                                  |
| [`backend/src/auth/constants.ts`](backend/src/auth/constants.ts)                                                     | Ewentualnie dodać stałe dla Enterprise                                                    |
| [`frontend/src/types/filters.ts`](frontend/src/types/filters.ts)                                                     | Dodać `type` do `SearchFilters`                                                           |
| [`frontend/src/types/index.ts`](frontend/src/types/index.ts)                                                         | Dodać `EnterpriseProfile`, `EnterpriseInstructor`, itp.                                   |
| [`frontend/src/hooks/useInstructors.ts`](frontend/src/hooks/useInstructors.ts)                                       | Rozszerzyć lub stworzyć `useSearch.ts`                                                    |
| [`frontend/src/components/instructors/filters-sidebar.tsx`](frontend/src/components/instructors/filters-sidebar.tsx) | Dodać filtr typu + warunkowe filtry Enterprise                                            |
| [`frontend/src/components/instructors/results-section.tsx`](frontend/src/components/instructors/results-section.tsx) | Dodać renderowanie kart Enterprise                                                        |
| [`frontend/src/components/layout/navbar.tsx`](frontend/src/components/layout/navbar.tsx)                             | Ewentualnie dodać link "Dla firm"                                                         |
| [`frontend/src/app/[locale]/(auth)/register/page.tsx`](<frontend/src/app/[locale]/(auth)/register/page.tsx>)         | Dodać trzecią kartę "Dołącz jako Partner"                                                 |

---

## 12. Kolejność implementacji

### Faza 0 — Przygotowanie (1-2 dni)

- [ ] Stworzyć dokument architektury (✅ zrobione)
- [ ] Przedyskutować i zatwierdzić model biznesowy (cennik, plany)
- [ ] Wybrać provider płatności (Stripe vs Paddle)

### Faza 1 — Backend: modele + CRUD (3-4 dni)

- [ ] Dodać modele Prisma: `EnterpriseProfile`, `EnterpriseInstructor`, `EnterpriseNews`, `EnterpriseLead`
- [ ] Dodać enumy: `EnterpriseCategory`, `EnterpriseStatus`, `InvitationStatus`
- [ ] Zmodyfikować `User` (relacja do `EnterpriseProfile`), `InstructorProfile` (relacja do `EnterpriseInstructor`), `NotificationType`
- [ ] Stworzyć `prisma migrate dev`
- [ ] Stworzyć moduł NestJS: `EnterpriseModule`
- [ ] Stworzyć `EnterpriseLeadsService` + `EnterpriseLeadsController` (zgłoszenia)
- [ ] Stworzyć `EnterpriseService` + `EnterpriseController` (CRUD profilu)
- [ ] Stworzyć `EnterpriseInvitationsService` + `EnterpriseInvitationsController` (zaproszenia)
- [ ] Stworzyć endpoint `GET /enterprise/:slug` (profil publiczny)
- [ ] Stworzyć endpoint `GET /enterprise/:id/instructors` (lista instruktorów)
- [ ] Stworzyć endpoint `GET /enterprise/:id/rating` (agregacja opinii)

### Faza 2 — Backend: wyszukiwarka (1-2 dni)

- [ ] Stworzyć `SearchModule`
- [ ] Stworzyć `SearchService` (łączy wyniki z instructor-profiles i enterprise)
- [ ] Stworzyć `SearchController` (`GET /search?q=&city=&type=`)
- [ ] Dodać indeksy w Prisma dla pól wyszukiwania

### Faza 3 — Frontend: profil publiczny Enterprise (2-3 dni)

- [ ] Stworzyć typy: `frontend/src/types/enterprise.ts`
- [ ] Stworzyć hook: `useEnterpriseProfile.ts`
- [ ] Stworzyć komponenty: `EnterpriseHeader`, `EnterpriseInstructors`, `EnterpriseGallery`, `EnterpriseNews`, `EnterpriseLocation`, `EnterpriseContact`, `EnterpriseAmenities`, `EnterpriseRating`
- [ ] Stworzyć stronę: `frontend/src/app/[locale]/enterprise/[slug]/page.tsx`

### Faza 4 — Frontend: onboarding Enterprise (1-2 dni)

- [ ] Stworzyć `EnterpriseApplyForm.tsx`
- [ ] Stworzyć `useEnterpriseApply.ts`
- [ ] Stworzyć stronę: `frontend/src/app/[locale]/enterprise/apply/page.tsx`
- [ ] Dodać kartę "Dołącz jako Partner" na stronie `/register`

### Faza 5 — Frontend: dashboard Enterprise (2-3 dni)

- [ ] Stworzyć `EnterpriseDashboard.tsx`
- [ ] Stworzyć `EnterpriseProfileForm.tsx` (edycja profilu)
- [ ] Stworzyć `EnterpriseInstructorManager.tsx` (zarządzanie + zapraszanie)
- [ ] Stworzyć `EnterpriseNewsManager.tsx` (dodawanie aktualności)
- [ ] Stworzyć `EnterpriseSettings.tsx` (subskrypcja)
- [ ] Stworzyć strony dashboardu

### Faza 6 — Frontend: wyszukiwarka (2-3 dni)

- [ ] Rozszerzyć `frontend/src/types/filters.ts` o `type`
- [ ] Stworzyć `useSearch.ts` (rozszerzenie `useInstructors`)
- [ ] Zmodyfikować `FiltersSidebar` — dodać filtr typu + warunkowe filtry
- [ ] Zmodyfikować `ResultsSection` — dodać karty Enterprise
- [ ] Stworzyć kartę wyniku Enterprise
- [ ] Zmienić placeholder wyszukiwarki

### Faza 7 — System zaproszeń (1-2 dni)

- [ ] Frontend: lista zaproszeń w dashboardzie instruktora
- [ ] Frontend: akceptacja/odrzucenie zaproszenia
- [ ] Frontend: powiadomienia o zaproszeniach
- [ ] Backend: rozszerzenie `NotificationService` o nowe typy

### Faza 8 — Płatności (2-3 dni)

- [ ] Integracja Stripe/Paddle
- [ ] Webhooki: `invoice.paid`, `subscription.canceled`, `subscription.updated`
- [ ] Frontend: strona z wyborem planu
- [ ] Frontend: status subskrypcji w dashboardzie
- [ ] Backend: guard sprawdzający `subscriptionStatus`

### Faza 9 — Polerka i testy (2-3 dni)

- [ ] Testy backend (e2e dla krytycznych ścieżek)
- [ ] Testy frontend (komponenty)
- [ ] Responsywność profilu Enterprise
- [ ] SEO (metadata, OG tags)
- [ ] i18n (pl/en dla wszystkich nowych tekstów)

---

**Łącznie**: ~16-23 dni roboczych (3-4 tygodnie)

---

## 13. Pytania do rozstrzygnięcia

| Pytanie                                                        | Decyzja                                                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Enterprise = osobne konto czy admin istniejącego usera?        | **Osobne konto** — `UserRole.ENTERPRISE` z 1:1 do `EnterpriseProfile`.                                                    |
| Płatność przed czy po akceptacji?                              | **Po akceptacji** (Option B) — admin Trainly akceptuje lead, potem firma wybiera plan i płaci.                            |
| Czy Enterprise może mieć wielu adminów?                        | Na start: jeden właściciel (User). Później można dodać `EnterpriseAdmin` (M:N).                                           |
| Czy instruktor może być w wielu Enterprise?                    | Tak — relacja M:N przez `EnterpriseInstructor`.                                                                           |
| Czy Enterprise widzi dane kontaktowe instruktora?              | Tylko jeśli instruktor zaakceptuje zaproszenie. Wtedy widzi: imię, nazwisko, email, telefon (jeśli instruktor udostępni). |
| Czy Enterprise może samo dodawać instruktorów bez zaproszenia? | Nie — instruktor musi zaakceptować.                                                                                       |
| Co z istniejącymi instruktorami którzy chcą być w Enterprise?  | Enterprise wysyła zaproszenie → instruktor akceptuje.                                                                     |
| Czy Enterprise może mieć własną domenę?                        | Na start: nie. Profil na `trainly.pl/partner/{slug}`.                                                                     |
| Czy płatności są obowiązkowe od第一天?                         | Tak — Enterprise to produkt premium od początku.                                                                          |
| Czy można zrobić trial (np. 14 dni)?                           | Tak — `subscriptionStatus: "trialing"`, po trial → wymagana płatność.                                                     |
| Czy Enterprise ma OAuth?                                       | Nie — tylko formularz zgłoszeniowy.                                                                                       |
