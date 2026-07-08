# Trainly — Postęp prac

## ✅ Zrobione (ta sesja)

### Enterprise w wyszukiwarce

- [x] Unified search hook (`useSearch.ts`) — jeden hook dla instruktorów i enterprise
- [x] Dwa endpointy: `/search` (dla mixed/enterprise) i `/instructor-profiles` (dla instruktorów)
- [x] Podział listingu na sekcje: "Instruktorzy" (pomarańczowy nagłówek) i "Partnerzy" (fioletowy nagłówek)
- [x] EnterpriseCard z fioletowym akcentem (border, avatar, badge)
- [x] Licznik: "5 trenerów" / "5 partnerów" w zależności od trybu
- [x] Empty state: pokazuje "Nie znaleziono" tylko gdy naprawdę nic nie ma
- [x] Sort dropdown zawsze widoczny (również dla enterprise)
- [x] Sortowanie context-aware: enterprise nie ma price-asc/price-desc
- [x] Sortowanie A-Z i Z-A dla obu trybów
- [x] SortBy faktycznie wysyłane do API i mapowane na Prisma orderBy
- [x] Duplikacja `getInstructorOrderBy` usunięta — wyciągnięta do `common/sort-utils.ts`
- [x] Domyślny typ widoku: "instructors" (nie "all")
- [x] i18n: wszystkie klucze dla enterprise (enterpriseCount, instructorsSection, enterprisesSection, nameAsc, nameDesc)

### Fixy z code review

- [x] totalPages = 0 gdy total = 0
- [x] role="alert" dla OAuth error
- [x] getTagName() dla tagów enterprise
- [x] Usunięty martwy kod (useInstructors.ts, client-side-filters.ts)
- [x] Math.random() → crypto.randomUUID() w enterprise-leads.service.ts
- [x] req! → req with guard w enterprise-invitations.controller.ts
- [x] any type dla where w enterprise-invitations.service.ts

## ❌ Do zrobienia (kolejna sesja)

### Rejestracja — karta Enterprise

- [ ] Dodać opcję "Partner/Enterprise" na stronie wyboru roli (`/register`)
- [ ] Formularz rejestracji dla enterprise (zbiera dane firmy)
- [ ] Po rejestracji → przekierowanie do formularza zgłoszeniowego (lead)
- [ ] Backend: obsługa roli ENTERPRISE w rejestracji

### Panel Enterprise (dashboard) — ✅ Zrobione

- [x] Dashboard dla enterprise (po akceptacji leada)
- [x] Zarządzanie profilem publicznym (edycja danych firmy)
- [x] System zaproszeń dla instruktorów (wysyłanie, akceptacja, odrzucanie)
- [x] Lista "Nasi instruktorzy" z możliwością usuwania
- [x] Statystyki (wyświetlenia profilu, liczba instruktorów)
- [ ] Ustawienia subskrypcji/płatności

### Publiczny profil Enterprise — ✅ Zrobione

- [x] EnterpriseHero — nagłówek profilu (zdjęcie, dane, social media)
- [x] EnterpriseProfilePage — layout profilu
- [x] EnterpriseInstructors — lista instruktorów w profilu
- [x] EnterpriseNews — aktualności
- [x] Pełna integracja z dashboardem (CRUD)

### Płatności / Subskrypcja

- [ ] Model subskrypcji w bazie
- [ ] Integracja z Stripe
- [ ] Sprawdzanie statusu subskrypcji przy wyświetlaniu profilu
