# Exercio — Technical Overview

> Dokument opisujący architekturę, bazę danych, zależności i wymagania hostingowe projektu Exercio (dawniej Trainly).  
> Cel: pomoc w podjęciu decyzji o wyborze hostingu bazy danych i infrastruktury.

---

## 1. Czym jest Exercio?

Exercio to **platforma do wyszukiwania i rezerwacji treningów / sesji z instruktorami**.  
Składa się z dwóch głównych części:

### Dla klientów (B2C)

- Przeglądanie profili instruktorów z filtrowaniem po specjalizacji, lokalizacji, języku
- Rejestracja / logowanie (email + OAuth: Google, Facebook)
- Rezerwacja sesji (wybór terminu z dostępności instruktora)
- Historia sesji w panelu klienta
- Wystawianie opinii po sesji (również jako gość bez konta)
- Zapisywanie ulubionych instruktorów

### Dla instruktorów

- Profil z bio, zdjęciami, filmami, galerią
- Zarządzanie dostępnością (weekly schedule + exceptions)
- Ustawianie cen, pakietów, usług
- Panel z rezerwacjami, potwierdzaniem / odrzucaniem
- Manual booking (dla klientów spoza platformy)

### Dla firm / enterprise (NOWOŚĆ)

- Profile firmowe (siłownie, szkoły tańca, kluby sportowe itp.)
- Zarządzanie instruktorami przypisanymi do firmy (invitation system)
- News feed (linki do social media, posty)
- Galeria, cennik, FAQ, godziny otwarcia
- Lead generation — formularz kontaktowy dla firm

---

## 2. Architektura aplikacji

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                  │
│  App Router · React 19 · Tailwind · next-intl (i18n)     │
│  Hosting: Vercel (Free)                                  │
├─────────────────────────────────────────────────────────┤
│                    Backend (NestJS)                       │
│  REST API · JWT auth · OAuth2 · Prisma ORM               │
│  Hosting: Hetzner VPS (Docker)                           │
├─────────────────────────────────────────────────────────┤
│                    Database (PostgreSQL)                  │
│  Prisma migrations · ~15 tabel                           │
│  Hosting: Hetzner VPS (PostgreSQL w Docker)              │
├─────────────────────────────────────────────────────────┤
│                    File Storage                          │
│  Zdjęcia, filmy, galerie instruktorów i firm             │
│  Hosting: Cloudflare R2 (S3-compatible)                  │
└─────────────────────────────────────────────────────────┘
```

### Frontend — stack

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui (Radix UI primitives)
- **next-intl** — internacjonalizacja (PL / EN)
- **Zustand** — state management (auth store)
- **TanStack React Query** — server state, cache, mutations
- **Framer Motion** — animacje
- **Lucide React** — ikony

### Backend — stack

- **NestJS** (Express pod spodem)
- **TypeScript**
- **Prisma ORM** — type-safe database access
- **PostgreSQL** — jedyna supported database
- **JWT** — autoryzacja (access + refresh token)
- **Passport.js** — OAuth (Google, Facebook)
- **Nodemailer** — wysyłanie emaili (potwierdzenia, reset hasła, powiadomienia)
- **Multer** — upload plików (zdjęcia, filmy)

---

## 3. Baza danych — modele i relacje

### Główne tabele (~15 modeli)

| Model                   | Opis                                                | Kluczowe pola                                                                       |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `User`                  | Użytkownicy (CLIENT, INSTRUCTOR, ADMIN, ENTERPRISE) | email, password, role, provider (local/OAuth), avatarUrl                            |
| `InstructorProfile`     | Profile instruktorów                                | bio, specializations[], hourlyRate, gallery[], isBookingEnabled, weeklyAvailability |
| `Service`               | Usługi instruktora (np. "Trening personalny 60min") | name, price, duration                                                               |
| `Booking`               | Rezerwacje                                          | clientId, instructorId, startTime, status, price, guestEmail (dla gości)            |
| `Review`                | Opinie po sesji                                     | rating (1-5), comment, lowRatingReason, isGuestReview                               |
| `Favorite`              | Ulubieni instruktorzy                               | userId + instructorProfileId (unique)                                               |
| `Availability`          | Tygodniowa dostępność                               | dayOfWeek, startTime, endTime                                                       |
| `AvailabilityException` | Wyjątki w dostępności                               | date, isAvailable, startTime, endTime                                               |
| `Notification`          | Powiadomienia                                       | type, title, message, read                                                          |
| `ProfileView`           | Licznik wyświetleń profilu                          | userId + instructorProfileId                                                        |
| `VerificationCode`      | Kody weryfikacyjne email                            | email, code, type, expiresAt                                                        |
| `ContactMessage`        | Wiadomości z formularza kontaktowego                | name, email, category, message                                                      |
| `EnterpriseProfile`     | Profile firmowe                                     | companyName, slug, openingHours (JSON), gallery[], videos[], amenities[]            |
| `EnterpriseInstructor`  | Instruktorzy przypisani do firmy                    | enterpriseId, instructorId, status (PENDING/ACCEPTED/REJECTED)                      |
| `EnterpriseNews`        | News feed firmy                                     | type (link/post), url, title, description                                           |
| `EnterpriseLead`        | Lead z formularza "Załóż konto firmowe"             | companyName, email, businessType, instructorCount                                   |

### Relacje (diagram koncepcyjny)

```
User ──1:1──> InstructorProfile ──1:N──> Service
                                        ──1:N──> Availability
                                        ──1:N──> AvailabilityException
                                        ──1:N──> Favorite
                                        ──1:N──> ProfileView
                                        ──N:M──> EnterpriseProfile (przez EnterpriseInstructor)

User ──1:N──> Booking (jako client)
User ──1:N──> Booking (jako instructor)
User ──1:N──> Review
User ──1:N──> Notification
User ──1:1──> EnterpriseProfile

Booking ──1:1──> Review
Booking ──N:1──> Service
```

### Enums

- `UserRole`: CLIENT, INSTRUCTOR, ADMIN, ENTERPRISE
- `BookingStatus`: PENDING, CONFIRMED, COMPLETED, CANCELLED, EXPIRED
- `NotificationType`: FAVORITE, NEW_BOOKING, NEW_REVIEW, BOOKING_CANCELLED, ENTERPRISE_INVITATION, ENTERPRISE_INVITATION_ACCEPTED
- `EnterpriseCategory`: DANCE_SCHOOL, GYM, FITNESS_CLUB, YOGA_STUDIO, PILATES_STUDIO, MARTIAL_ARTS, SWIMMING_POOL, PERSONAL_TRAINING_STUDIO, SPORTS_CENTER, OTHER
- `EnterpriseStatus`: PENDING, ACTIVE, SUSPENDED, REJECTED
- `InvitationStatus`: PENDING, ACCEPTED, REJECTED, REMOVED

---

## 4. Media — zdjęcia i filmy

### Co przechowujemy

- **Avatar użytkownika** — 1 plik (User.avatarUrl)
- **Zdjęcie profilowe instruktora** — 1 plik (InstructorProfile.photoUrl)
- **Galeria instruktora** — wiele zdjęć/filmów (InstructorProfile.gallery[])
- **Logo firmy** — 1 plik (EnterpriseProfile.logoUrl)
- **Zdjęcie w tle firmy (cover)** — 1 plik (EnterpriseProfile.coverUrl)
- **Galeria firmy** — wiele zdjęć (EnterpriseProfile.gallery[])
- **Filmy firmowe** — wiele filmów (EnterpriseProfile.videos[])
- **About image** — 1 plik (EnterpriseProfile.aboutImage)
- **Miniaturki newsów** — wiele plików (EnterpriseNews.thumbnailUrl)

### Ograniczenia (już zaimplementowane)

- Zdjęcia: max 5MB
- Filmy: max 50MB
- Format: JPEG, PNG, WebP, GIF (zdjęcia) + MP4, WebM, MOV (filmy)

### Obecnie

- Pliki zapisywane lokalnie w `backend/uploads/`
- Serwowane przez NestJS jako static assets

### Docelowo (Cloudflare R2)

- **Cloudflare R2** — wybrany ze względu na:
  - Zero opłat za egress (transfer wychodzący)
  - S3-compatible (łatwa migracja)
  - Niski koszt: ~$0.015/GB/miesiąc
  - Idealne na start — praktycznie 0 zł na początku

---

## 5. Wybrana infrastruktura

### Decyzja: Opcja B — Hetzner + Cloudflare R2 (najtaniej)

| Komponent         | Wybór                     | Koszt                    |
| ----------------- | ------------------------- | ------------------------ |
| **Frontend**      | Vercel (Free)             | $0                       |
| **Backend**       | Hetzner VPS CX22          | ~4-5 €/mies. (~17-21 zł) |
| **PostgreSQL**    | Hetzner VPS (Docker)      | — (wliczone w VPS)       |
| **File Storage**  | Cloudflare R2             | ~$0.015/GB/mies. (~0 zł) |
| **DNS + SSL**     | Cloudflare                | $0                       |
| **Domena (.app)** | Namecheap / Porkbun / OVH | ~15-20 €/rok (~65-86 zł) |

**Łączny koszt**: ~30-40 zł/miesiąc (głównie VPS + domena w skali roku).

### Diagram infrastruktury

```
Cloudflare
│
├── DNS
├── SSL (origin certificates)
│
├──── exercio.app
│
├── Vercel
│     Frontend Next.js
│
└── api.exercio.app
      │
      │
      VPS Hetzner (CX22)
      │
      ├── Docker
      │   ├── NestJS (backend)
      │   ├── PostgreSQL
      │   └── Nginx (reverse proxy)
      │
      └── Prisma (migrations)

Cloudflare R2
│
├── zdjęcia (avatary, galerie, loga)
└── filmy (instruktorzy, firmy)
```

### Dlaczego Hetzner VPS?

**Plusy:**

- ✅ Bardzo tani — CX22 (~4-5 €/mies.) wystarcza na start
- ✅ Świetna wydajność jak na tę cenę
- ✅ Europejskie data center (Norymberga, Helsinki)
- ✅ Pełna kontrola — Docker, Nginx, backup według własnych potrzeb
- ✅ PostgreSQL lokalnie — niski latency, brak limitów połączeń
- ✅ Łatwy scaling w przyszłości (większy VPS)

**Minusy:**

- ❌ Samodzielne aktualizacje i backupy
- ❌ Brak managed DB (ale przy jednym VPS to nie jest trudne)

### Dlaczego Cloudflare R2?

- **Zero opłat za egress** — kluczowe przy filmach (nawet przy dużej skali)
- S3-compatible — używamy tego samego SDK co dla AWS S3
- Integracja z Cloudflare (DNS, SSL) — wszystko w jednym miejscu

### Dlaczego Vercel?

- Naturalny wybór dla Next.js — zero konfiguracji
- Darmowy tier w pełni wystarczający na MVP
- Auto-deploy z GitHub
- Edge Functions, ISR, SSR — wszystko wspierane

---

## 6. Uwagi dotyczące domeny

- `trainly.com` / `trainly.pl` — prawdopodobnie zajęte
- `exercio.app` — dostępna? (nazwa z łaciny, unikalna)
- Rekomendowani rejestratorzy: Namecheap, Porkbun, OVH
- Domena .app wymaga HTTPS (co i tak mamy przez Cloudflare)

---

## 7. Podsumowanie — co jest kluczowe dla decyzji

1. **PostgreSQL** — to jedyna baza, Prisma nie wspiera nic innego produkcyjnie
2. **Media (filmy!)** — największy wpływ na koszty storage i transfer. Filmy do 50MB, ale przy skali to będą GB. Cloudflare R2 rozwiązuje to najtaniej
3. **i18n** — PL + EN, ale locale nie wpływa na wybór DB
4. **OAuth** — Google + Facebook, wymaga HTTPS w produkcji (Cloudflare SSL)
5. **Email** — Nodemailer, potrzebny SMTP (SendGrid / Mailgun / Resend)
6. **Skalowalność** — na start wystarczy mała instancja, ale DB musi mieć opcję backupu (cron na VPS)
7. **Koszt** — ~30-40 zł/mies. to realny budżet na start, najniższy z możliwych przy pełnej kontroli
