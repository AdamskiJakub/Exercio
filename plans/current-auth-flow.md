# Current Authentication & Registration Flow

## Overview

Trainly has **3 user roles**: `CLIENT`, `INSTRUCTOR`, `ADMIN` (defined in Prisma enum [`UserRole`](backend/prisma/schema.prisma:259)).

Users can register via:

1. **Manual registration** (email + password) — `provider: "local"`
2. **OAuth** (Google / Facebook) — `provider: "google"` or `"facebook"`

---

## 1. Database Schema (`User` model)

[`User`](backend/prisma/schema.prisma:9) model key fields:

| Field             | Type                          | Notes                               |
| ----------------- | ----------------------------- | ----------------------------------- |
| `id`              | `String @id @default(uuid())` | Primary key                         |
| `email`           | `String @unique`              | Login identifier                    |
| `password`        | `String?`                     | Nullable — `null` for OAuth users   |
| `username`        | `String @unique`              | Auto-generated                      |
| `role`            | `UserRole @default(CLIENT)`   | `CLIENT`, `INSTRUCTOR`, or `ADMIN`  |
| `provider`        | `String @default("local")`    | `"local"`, `"google"`, `"facebook"` |
| `providerId`      | `String?`                     | OAuth provider user ID              |
| `isEmailVerified` | `Boolean @default(false)`     | Auto-`true` for OAuth               |
| `phone`           | `String?`                     | Required for instructor onboarding  |

**Unique constraint**: `@@unique([provider, providerId])` — one account per OAuth identity.

---

## 2. Manual Registration Flow

### 2.1 Role Selection Page

[`/register`](<frontend/src/app/[locale]/(auth)/register/page.tsx>) shows two cards:

- **Client card** → links to `/register/client`
- **Instructor card** → links to `/register/instructor?intent=instructor`

### 2.2 Registration Form

Both [`/register/client`](<frontend/src/app/[locale]/(auth)/register/client/page.tsx>) and [`/register/instructor`](<frontend/src/app/[locale]/(auth)/register/instructor/page.tsx>) render the same [`RegisterForm`](frontend/src/components/forms/RegisterForm.tsx) component with different `intent` prop (`"client"` or `"instructor"`).

The form uses:

- [`useRegisterForm`](frontend/src/hooks/useRegisterForm.ts) hook — handles validation + API call
- [`register-form`](frontend/src/lib/validations/register-form.ts) validation schema — Zod with conditional phone requirement for instructors

### 2.3 Backend Registration

[`AuthController.register()`](backend/src/auth/auth.controller.ts:40) → [`AuthService.register()`](backend/src/auth/auth.service.ts:101) → [`createUserWithProfile()`](backend/src/auth/auth.service.ts:25)

Key behavior:

- If `role === 'INSTRUCTOR'`, creates `InstructorProfile` immediately (empty, `isDraft: true`)
- Always sets `isEmailVerified: false`
- Sends verification email via [`sendVerificationCode()`](backend/src/auth/auth.service.ts:319)
- **Does NOT set `access_token` cookie** — user must verify email first
- Returns `{ message, user }` (no token)

### 2.4 Email Verification

Frontend: [`/verify-email`](<frontend/src/app/[locale]/(auth)/verify-email/page.tsx>) → [`VerifyEmailForm`](frontend/src/components/auth/VerifyEmailForm.tsx) → [`useVerifyEmailForm`](frontend/src/hooks/useVerifyEmailForm.ts)

Backend: [`AuthController.verifyEmail()`](backend/src/auth/auth.controller.ts:130) → [`AuthService.verifyEmail()`](backend/src/auth/auth.service.ts:358)

Key behavior:

- Validates 6-digit code from `VerificationCode` table
- Sets `isEmailVerified: true`
- **Sets `access_token` cookie** via `res.cookie('access_token', token, COOKIE_OPTIONS)`
- Returns `{ user }` (token is in cookie, not in response body)

Frontend after verification:

- Stores user in Zustand (`useAuthStore.setAuth()`)
- If `user.role === 'INSTRUCTOR'` → redirects to `/dashboard/profile/edit` (profile completion)
- If `user.role === 'CLIENT'` → redirects to `/dashboard`

### 2.5 Login

[`/login`](<frontend/src/app/[locale]/(auth)/login/page.tsx>) → [`useLoginForm`](frontend/src/hooks/useLoginForm.ts) → [`AuthController.login()`](backend/src/auth/auth.controller.ts:47) → [`AuthService.login()`](backend/src/auth/auth.service.ts:105)

Key behavior:

- Validates email + password (bcrypt compare)
- **Blocks login if `!isEmailVerified`** — returns error "Please verify your email before logging in"
- Shows "Verify email now" link in the error UI
- Sets `access_token` cookie
- Returns `{ user }`

---

## 3. OAuth Flow (Google / Facebook)

### 3.1 OAuth Intent Mechanism

When a user clicks an OAuth button (Google/Facebook) from a page with `?intent=instructor` query param:

[`SocialLoginButtons`](frontend/src/components/auth/SocialLoginButtons.tsx:8) calls `saveOAuthIntent()`:

```ts
function saveOAuthIntent() {
  const params = new URLSearchParams(window.location.search);
  const intent = params.get("intent");
  if (intent) {
    sessionStorage.setItem("oauthIntent", intent);
  }
}
```

This stores `"instructor"` in `sessionStorage` before redirecting to the OAuth provider.

### 3.2 OAuth Authentication

Backend Passport strategies:

- [`GoogleStrategy`](backend/src/auth/strategies/google.strategy.ts)
- [`FacebookStrategy`](backend/src/auth/strategies/facebook.strategy.ts)

Routes:

- `GET /auth/google` → redirects to Google
- `GET /auth/google/callback` → [`handleOAuthCallback()`](backend/src/auth/auth.controller.ts:89)
- `GET /auth/facebook` → redirects to Facebook
- `GET /auth/facebook/callback` → [`handleOAuthCallback()`](backend/src/auth/auth.controller.ts:89)

### 3.3 OAuth User Creation

[`AuthService.findOrCreateOAuthUser()`](backend/src/auth/auth.service.ts:151):

1. Looks up by `provider + providerId` composite unique
2. If not found, looks up by email
3. If email exists with different OAuth provider → error
4. If email exists with `provider: "local"` → updates with OAuth data (avatar, name), sets `isEmailVerified: true`
5. If completely new → creates user with `role: 'CLIENT'`, `isEmailVerified: true`, `password: null`
6. Generates JWT token

**Always creates as `CLIENT`** — OAuth users who want to be instructors must go through the onboarding flow.

### 3.4 OAuth Callback (Frontend)

[`AuthController.handleOAuthCallback()`](backend/src/auth/auth.controller.ts:89):

- Sets `access_token` cookie
- Redirects to `/{locale}/auth/callback?success=true`

[`/auth/callback`](frontend/src/app/[locale]/auth/callback/page.tsx):

1. Calls `GET /auth/me` to get user data
2. Stores user in Zustand (`setAuth()`)
3. Checks `sessionStorage` for `oauthIntent`:
   - If `"instructor"` → redirects to `/onboarding/instructor`
   - Otherwise → redirects to `/dashboard`
4. Uses `window.location.replace()` (not `router.push()`) to replace history entry
5. Has `processedRef` guard to prevent double execution in StrictMode
6. Has auth guard: if already authenticated (back-navigation), redirects immediately

### 3.5 Instructor Onboarding (OAuth only)

[`/onboarding/instructor`](frontend/src/app/[locale]/onboarding/instructor/page.tsx):

- Simple form asking for phone number
- Calls [`POST /users/become-instructor`](backend/src/users/users.controller.ts:48) → [`UsersService.becomeInstructor()`](backend/src/users/users.service.ts:84)

`becomeInstructor()`:

- Validates user has `role: 'CLIENT'`
- Checks no existing `InstructorProfile`
- In a Prisma transaction:
  - Sets `role: 'INSTRUCTOR'`
  - Sets `phone`
  - Creates `InstructorProfile` (empty, `isDraft: true` by default)
- Returns updated user + instructor profile

After success → redirects to `/dashboard/profile/edit` (profile completion page)

---

## 4. Authentication Architecture

### 4.1 JWT Token

- Generated by [`generateToken()`](backend/src/auth/auth.service.ts:281)
- Payload: `{ sub: userId, email, role }`
- Stored in **httpOnly cookie** named `access_token`
- Cookie options: `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 days`

### 4.2 JWT Validation

[`JwtStrategy`](backend/src/auth/strategies/jwt.strategy.ts):

- Extracts JWT from cookie first (`req.cookies.access_token`)
- Falls back to `Authorization: Bearer` header
- Validates and returns `{ id, email, role }`

### 4.3 Frontend API Client

[`apiClient`](frontend/src/lib/api.ts):

- Axios instance with `withCredentials: true` (sends cookies cross-origin)
- 401 interceptor: logs out + redirects to login (excludes auth endpoints)

### 4.4 Auth State (Zustand)

[`useAuthStore`](frontend/src/stores/auth-store.ts):

- Persisted to `localStorage` (key: `trainly-auth`)
- Stores: `user`, `isAuthenticated`
- Methods: `setAuth()`, `logout()`, `updateUser()`

### 4.5 Auth Guard

[`useAuthGuard`](frontend/src/hooks/useAuthGuard.ts):

- Waits for Zustand hydration
- Checks authentication + role requirements
- Redirects to login if not authenticated

---

## 5. Role Upgrade Path (Client → Instructor)

Existing CLIENT users can upgrade via:

1. **CTA Banner** in [`ClientDashboard`](frontend/src/components/dashboard/ClientDashboard.tsx) — [`BecomeInstructorBanner`](frontend/src/components/dashboard/BecomeInstructorBanner.tsx) with purple gradient, X dismiss (30-day localStorage), "Zostań instruktorem" button
2. **"Zostań instruktorem" card** below the banner (always visible)
3. Both link to `/onboarding/instructor`

---

## 6. Key Files Reference

### Backend

| File                                                                                                   | Purpose                                               |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)                                         | All models: User, InstructorProfile, Booking, etc.    |
| [`backend/src/auth/auth.service.ts`](backend/src/auth/auth.service.ts)                                 | Core auth logic: register, login, OAuth, verify email |
| [`backend/src/auth/auth.controller.ts`](backend/src/auth/auth.controller.ts)                           | HTTP endpoints for auth                               |
| [`backend/src/auth/strategies/jwt.strategy.ts`](backend/src/auth/strategies/jwt.strategy.ts)           | JWT extraction from cookie/header                     |
| [`backend/src/auth/strategies/google.strategy.ts`](backend/src/auth/strategies/google.strategy.ts)     | Google OAuth strategy                                 |
| [`backend/src/auth/strategies/facebook.strategy.ts`](backend/src/auth/strategies/facebook.strategy.ts) | Facebook OAuth strategy                               |
| [`backend/src/users/users.service.ts`](backend/src/users/users.service.ts)                             | User CRUD + becomeInstructor                          |
| [`backend/src/users/users.controller.ts`](backend/src/users/users.controller.ts)                       | User endpoints (all JWT-guarded)                      |
| [`backend/src/users/dto/become-instructor.dto.ts`](backend/src/users/dto/become-instructor.dto.ts)     | DTO: `{ phone: string }`                              |
| [`backend/src/auth/dto/register.dto.ts`](backend/src/auth/dto/register.dto.ts)                         | Registration DTO                                      |

### Frontend

| File                                                                                                                               | Purpose                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`frontend/src/app/[locale]/(auth)/register/page.tsx`](<frontend/src/app/[locale]/(auth)/register/page.tsx>)                       | Role selection (client vs instructor)             |
| [`frontend/src/app/[locale]/(auth)/register/client/page.tsx`](<frontend/src/app/[locale]/(auth)/register/client/page.tsx>)         | Client registration page                          |
| [`frontend/src/app/[locale]/(auth)/register/instructor/page.tsx`](<frontend/src/app/[locale]/(auth)/register/instructor/page.tsx>) | Instructor registration page                      |
| [`frontend/src/components/forms/RegisterForm.tsx`](frontend/src/components/forms/RegisterForm.tsx)                                 | Unified registration form                         |
| [`frontend/src/hooks/useRegisterForm.ts`](frontend/src/hooks/useRegisterForm.ts)                                                   | Registration form hook                            |
| [`frontend/src/lib/validations/register-form.ts`](frontend/src/lib/validations/register-form.ts)                                   | Zod validation schema                             |
| [`frontend/src/app/[locale]/(auth)/login/page.tsx`](<frontend/src/app/[locale]/(auth)/login/page.tsx>)                             | Login page                                        |
| [`frontend/src/hooks/useLoginForm.ts`](frontend/src/hooks/useLoginForm.ts)                                                         | Login form hook                                   |
| [`frontend/src/components/auth/SocialLoginButtons.tsx`](frontend/src/components/auth/SocialLoginButtons.tsx)                       | Google/Facebook OAuth buttons                     |
| [`frontend/src/app/[locale]/auth/callback/page.tsx`](frontend/src/app/[locale]/auth/callback/page.tsx)                             | OAuth callback handler                            |
| [`frontend/src/app/[locale]/onboarding/instructor/page.tsx`](frontend/src/app/[locale]/onboarding/instructor/page.tsx)             | Instructor phone onboarding                       |
| [`frontend/src/hooks/useBecomeInstructor.ts`](frontend/src/hooks/useBecomeInstructor.ts)                                           | becomeInstructor API hook                         |
| [`frontend/src/stores/auth-store.ts`](frontend/src/stores/auth-store.ts)                                                           | Zustand auth state (persisted)                    |
| [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts)                                                                               | Axios client with 401 interceptor                 |
| [`frontend/src/hooks/useAuthGuard.ts`](frontend/src/hooks/useAuthGuard.ts)                                                         | Route protection hook                             |
| [`frontend/src/i18n/routing.ts`](frontend/src/i18n/routing.ts)                                                                     | i18n routing config (locale prefixes + pathnames) |
| [`frontend/src/components/dashboard/ClientDashboard.tsx`](frontend/src/components/dashboard/ClientDashboard.tsx)                   | Client dashboard with upgrade CTA                 |
| [`frontend/src/components/dashboard/BecomeInstructorBanner.tsx`](frontend/src/components/dashboard/BecomeInstructorBanner.tsx)     | Premium CTA banner                                |

---

## 7. Current Limitations / Design Decisions

1. **No ENTERPRISE/PARTNER role** — only `CLIENT`, `INSTRUCTOR`, `ADMIN`
2. **Instructor is free** — no monetization for instructor accounts
3. **OAuth always creates CLIENT** — instructor upgrade requires explicit onboarding
4. **Manual registration creates INSTRUCTOR immediately** — if instructor tile is selected
5. **Email verification required** for manual registration before login
6. **OAuth users skip email verification** — `isEmailVerified: true` by default
7. **No subscription/payment system** — no Stripe integration for paid accounts
8. **No enterprise-specific features** — no team management, billing, etc.
