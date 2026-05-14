# STRYNTH — Frontend

Angular 21 SPA for the STRYNTH fitness booking platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| State | Angular Signals (`signal`, `computed`, `toSignal`) |
| Forms | Angular Reactive Forms |
| HTTP | `HttpClient` + custom `ApiService` wrapper |
| Styling | SCSS with CSS custom properties (design token system) |
| Change detection | `OnPush` throughout |
| Routing | Lazy-loaded via `loadComponent` |
| Build | Angular CLI + `ng build --configuration production` |
| Server (prod) | nginx 1.27-alpine (multi-stage Docker build) |

---

## Project Structure

```
src/
  app/
    core/
      constants/
        api.constants.ts        — all API endpoint strings
      guards/
        auth.guards.ts          — authGuard, traineeGuard, trainerGuard, adminGuard
      http/
        interceptors/
          auth-token.interceptor.ts — attaches Bearer JWT to every outgoing request
      models/
        api.models.ts           — ApiResponse<T> generic response type
      services/
        api.service.ts          — thin HttpClient wrapper (get/post/put/patch/delete)
        auth.service.ts         — login, logout, signup; isLoggedIn/isTrainee/isTrainer/isAdmin signals
    features/
      auth/                     — login + signup pages
      trainee/
        shell/                  — top bar + bottom nav (Home | Bookings | Profile)
        pages/
          home/                 — trainer discovery, search + specialty filter chips
          trainer-detail/       — trainer bio, session list, booking summary, → /payment
          bookings/             — confirmed bookings list, post-payment success banner
          profile/              — account info, avatar upload, My Bookings link, logout
      trainer/
        shell/                  — bottom nav (Home | Create | Profile)
        pages/
          home/                 — dashboard: stats, confirmed bookings, available sessions
          profile/              — account info, edit bio/specialties/experience, avatar upload
      admin/
        shell/                  — sidebar: Home | Bookings | Sessions | Users | Profile
        pages/
          home/                 — platform stats
          bookings/             — all bookings across platform
          sessions/             — all sessions (edit time/capacity/status/price)
          users/                — all users (edit role + trainer profile)
          profile/              — account info, logout
      booking/
        models/                 — Booking, BookAndPayRequest, BookAndPayResponse
        services/               — getMyBookings, getTrainerBookings
      sessions/
        models/                 — Session, CreateSessionRequest, UpdateSessionRequest
        services/               — CRUD for sessions
      checkout/
        pages/payment/          — payment form (card number, expiry, CVV, cardholder name)
        services/               — bookAndPay (POST /bookings/pay)
    shared/
      components/ui/
        badge/                  — status badge
        button/                 — primary | secondary variants
        chip/                   — filter chip
        rating-stars/           — star rating display
        search-bar/             — search input
        section-title/          — section heading
        trainer-card/           — trainer summary card
        session-bookers/        — expandable bookers list for a session
        avatar-upload/          — profile image upload control
  styles/
    abstracts/_variables.scss   — all design tokens as CSS custom properties
    themes/_dark-neon.scss      — dark neon theme overrides
  environments/
    environment.ts              — apiUrl, mediaUrl
```

---

## Route Structure

| Path | Guard | Description |
|------|-------|-------------|
| `/login` | — | Login page |
| `/signup` | — | Registration page |
| `/trainee/home` | `traineeGuard` | Trainer discovery |
| `/trainee/trainer/:id` | `traineeGuard` | Trainer detail + session booking |
| `/trainee/bookings` | `traineeGuard` | My bookings (post-payment landing) |
| `/trainee/profile` | `traineeGuard` | Trainee account page |
| `/payment` | `authGuard` | Payment form |
| `/trainer/home` | `trainerGuard` | Trainer dashboard |
| `/trainer/create` | `trainerGuard` | Manage sessions |
| `/trainer/profile` | `trainerGuard` | Trainer account page |
| `/admin/home` | `adminGuard` | Platform stats |
| `/admin/bookings` | `adminGuard` | All bookings |
| `/admin/sessions` | `adminGuard` | All sessions |
| `/admin/users` | `adminGuard` | All users |
| `/admin/profile` | `adminGuard` | Admin account page |

---

## Booking Flow

1. Trainee browses trainers → `GET /trainers`
2. Trainee opens trainer detail → `GET /trainers/:id` + `GET /sessions/available`
3. Trainee selects a session → navigates to `/payment?sessionId=&trainerName=&sessionTime=&amount=`
4. Payment form validates card fields client-side (custom validators for card number, expiry, CVV)
5. Submit → `POST /api/v1/bookings/pay` (`{ session_id, amount, payment_method: 'card' }`)
6. On `status === 'paid'` → navigate to `/trainee/bookings` with success banner

---

## Design System

All design tokens are CSS custom properties defined in `styles/abstracts/_variables.scss` and overridden by the dark neon theme in `styles/themes/_dark-neon.scss`. No hardcoded hex values in component SCSS files.

Token categories: background, surface, primary (neon green), text, border, spacing scale (`--space-1` → `--space-8`), radius scale, shadows, typography scale.

Breakpoint: `48rem` (768 px). Mobile-first with `@media (min-width: 48rem)` overrides.

---

## Auth

- JWT stored in `localStorage['strynth_token']`
- User object stored in `localStorage['strynth_user']`
- `auth-token.interceptor.ts` automatically attaches `Authorization: Bearer <token>` to every request
- Role signals (`isTrainee`, `isTrainer`, `isAdmin`) drive route guards and UI branching

---

## Docker (multi-stage build)

```
Stage 1 — node:22-alpine   Build Angular production bundle
Stage 2 — nginx:1.27-alpine Serve dist + reverse-proxy /api/ and /uploads/ to backend
```

nginx proxies `/api/` → `http://backend:5000` and `/uploads/` → `http://backend:5000`, handles Angular's HTML5 routing with `try_files $uri /index.html`.

---

## Running Locally (without Docker)

```bash
cd "STRYNTH front-end"
npm install
ng serve          # dev server at http://localhost:4200
```

Ensure the backend is running on port 5000 and `proxy.conf.json` is configured if needed.
