# STRYNTH Frontend Architecture (Angular Standalone)

Mobile-first Angular 21 app using standalone components, signals, OnPush change detection, and a role-based shell architecture. Each role (trainee, trainer, admin) has its own shell with nested lazy-loaded routes.

## Folder Tree

```text
src/
  app/
    core/
      constants/
        api.constants.ts          — all backend endpoint strings
      guards/
        auth.guards.ts            — authGuard, traineeGuard, trainerGuard, adminGuard
      http/
        interceptors/
          auth-token.interceptor.ts — attaches Bearer JWT to every request
      models/
        api.models.ts             — shared HTTP response shape types
      services/
        api.service.ts            — thin HttpClient wrapper
        auth.service.ts           — login/logout/signup, computed role signals
    features/
      auth/
        models/
          auth.models.ts          — User, LoginRequest, LoginResponse, SignupRequest, UserRole
        pages/
          login/                  — login form, redirects by role on success
          register/               — signup form, sends to /login on success
      trainee/
        shell/                    — top bar with logo + profile avatar; bottom nav: Home | Bookings | Profile
        pages/
          home/                   — trainer list from GET /trainers, search + specialty filter chips
          trainer-detail/         — trainer info (bio, specialties, years experience), available sessions, direct nav to /payment
          bookings/               — all confirmed bookings for the logged-in trainee; shows success banner after payment
          profile/                — account info, avatar upload, "My Bookings" link (navigates to /trainee/bookings), logout
      trainer/
        shell/                    — bottom nav: Home | Create | Profile
        pages/
          home/                   — stats, confirmed bookings, available sessions
          profile/                — account info, edit description/specialties/years_experience via PUT /trainers/profile, avatar upload, logout
      admin/
        services/
          admin.service.ts        — getStats (forkJoin), getAllBookings, getAllSessions, getAllUsers, updateUser, updateTrainerProfile, updateSession, deleteSession
        shell/                    — top navbar: Home | Bookings | Sessions | Users | Profile
        pages/
          home/                   — platform stats, inline edit/delete for users, sessions, bookings
          bookings/               — all bookings across platform
          sessions/               — all sessions across platform (edit time/capacity/status via PUT /admin/sessions/:id)
          users/                  — all registered users (edit role + trainer profile fields)
          profile/                — account info, logout
      booking/
        models/
          booking.models.ts       — Booking, BookAndPayRequest, BookAndPayResponse
        services/
          booking.service.ts      — getMyBookings, getTrainerBookings (read-only)
      sessions/
        models/
          session.models.ts       — Session (includes bookings_count: number), CreateSessionRequest, UpdateSessionRequest
        services/
          session.service.ts      — getAvailableSessions, getTrainerSessions, createSession, updateSession, deleteSession
      checkout/
        pages/
          payment/                — reads sessionId/trainerName/sessionTime/amount from queryParams
        services/
          payment.service.ts      — bookAndPay (atomic POST /bookings/pay); interfaces: BookAndPayRequest, BookAndPayResponse
        pages/
          manage/                 — create/edit/delete sessions (used by /trainer/create route)

    shared/
      components/
        ui/
          badge/                  — status badge
          button/                 — ui-button, variants: primary | secondary
          chip/                   — filter chip
          rating-stars/           — star rating display
          search-bar/             — search input with icon
          section-title/          — section heading block
          trainer-card/           — trainer summary card
          session-bookers/        — toggle button + bookers list; inputs: bookers, expanded; output: toggle
  assets/
    branding/
    fonts/
    icons/
    images/
  environments/
  styles/
    abstracts/
      _variables.scss             — all design tokens as CSS custom properties
    themes/
      _dark-neon.scss             — dark neon theme overrides

docs/
  design-system.md
  frontend-architecture.md
```

## Route Structure

All routes are defined in `app.routes.ts` and lazy-load page components directly via `loadComponent`.

| Path | Guard | Shell | Description |
|---|---|---|---|
| `/login` | — | none | Login page |
| `/signup` | — | none | Registration page |
| `/trainee` | `traineeGuard` | `TraineeShellComponent` | Trainee shell |
| `/trainee/home` | `traineeGuard` | — | Trainer discovery |
| `/trainee/trainer/:id` | `traineeGuard` | — | Trainer detail + booking |
| `/trainee/bookings` | `traineeGuard` | — | My bookings (post-payment landing) |
| `/trainee/profile` | `traineeGuard` | — | Trainee profile |
| `/trainer` | `trainerGuard` | `TrainerShellComponent` | Trainer shell |
| `/trainer/home` | `trainerGuard` | — | Trainer dashboard |
| `/trainer/create` | `trainerGuard` | — | Manage sessions |
| `/trainer/profile` | `trainerGuard` | — | Trainer profile |
| `/admin` | `adminGuard` | `AdminShellComponent` | Admin shell |
| `/admin/home` | `adminGuard` | — | Platform stats |
| `/admin/bookings` | `adminGuard` | — | All bookings |
| `/admin/sessions` | `adminGuard` | — | All sessions |
| `/admin/users` | `adminGuard` | — | All users |
| `/admin/profile` | `adminGuard` | — | Admin profile |
| `/payment` | `authGuard` | none | Payment confirmation |
| `**` | — | none | Redirects to `/login` |

## Auth Guards

Defined in `core/guards/auth.guards.ts`:

- **`authGuard`** — any authenticated user; else → `/login`
- **`traineeGuard`** — trainee passes; else → `/login`
- **`trainerGuard`** — trainer passes; else → `/login`
- **`adminGuard`** — admin passes; else → `/login`

All unauthorized role access redirects to `/login` — no cross-role redirects.

## Auth Service

`core/services/auth.service.ts` exposes computed signals:

- `isLoggedIn` — true if a token exists in localStorage
- `isTrainee` — true if role === `'trainee'`
- `isTrainer` — true if role === `'trainer'`
- `isAdmin` — true if role === `'admin'`

JWT token stored at `localStorage['strynth_token']`. User object stored at `localStorage['strynth_user']`.

## Backend Integration

Base URL: `http://localhost:5000/api/v1`

All endpoints are defined as constants in `core/constants/api.constants.ts`. The `auth-token.interceptor.ts` automatically attaches the Bearer token to every outgoing request.

### API Endpoints Reference

| Constant | Method | Path |
|---|---|---|
| `AUTH.LOGIN` | POST | `/auth/login` |
| `AUTH.SIGNUP` | POST | `/auth/signup` |
| `AUTH.LOGOUT` | POST | `/auth/logout` |
| `TRAINERS.LIST` | GET | `/trainers` |
| `TRAINERS.GET(id)` | GET | `/trainers/:id` |
| `TRAINERS.UPDATE_PROFILE` | PUT | `/trainers/profile` |
| `SESSIONS.AVAILABLE` | GET | `/sessions/available` |
| `SESSIONS.TRAINER` | GET | `/sessions/trainer` |
| `SESSIONS.CREATE` | POST | `/sessions` |
| `SESSIONS.UPDATE(id)` | PATCH | `/sessions/:id` |
| `SESSIONS.DELETE(id)` | DELETE | `/sessions/:id` |
| `BOOKINGS.PAY` | POST | `/bookings/pay` |
| `BOOKINGS.MY` | GET | `/bookings/my` |
| `BOOKINGS.TRAINER` | GET | `/bookings/trainer` |
| `ADMIN.BOOKINGS` | GET | `/admin/bookings` |
| `ADMIN.SESSIONS` | GET | `/admin/sessions` |
| `ADMIN.USERS` | GET | `/admin/users` |
| `ADMIN.UPDATE_USER(id)` | PUT | `/admin/users/:id` |
| `ADMIN.UPDATE_TRAINER_PROFILE(id)` | PUT | `/admin/trainers/:id/profile` |
| `ADMIN.UPDATE_SESSION(id)` | PUT | `/admin/sessions/:id` |

### Error Handling

`ApiService.handleError` surfaces the real backend message from `error.error.message` or `error.error.error`. Falls back to a human-readable message per status code (400, 401, 403, 404, 409, 422, 429, 500). `DELETE` requests are read as text first to handle `204 No Content` gracefully.

## Key Component Notes

- **`ui-button`** — selector `ui-button`, valid variants: `'primary' | 'secondary'`. Has no `@Output() clicked` — always use native `(click)` bindings for button actions.
- **`ui-session-bookers`** — selector `ui-session-bookers`. Inputs: `bookers: Booking[]`, `expanded: boolean`. Output: `toggle` (no payload). Used on admin-sessions, manage-sessions, and trainer-home to expand/collapse a per-session bookers list. The parent holds `expandedSessionId` signal and a `bookersBySession` computed `Map<number, Booking[]>`.
- **Shell components** — each role shell wraps a `<router-outlet>` and provides the nav chrome. On mobile: fixed bottom tab bar. On desktop (≥ 48rem): left 13.5rem sidebar (trainer, admin) or inline topbar nav (trainee).

## Responsive Layout

Breakpoint: `48rem` (768px). Below this is treated as mobile.

| Shell | Mobile | Desktop (≥ 48rem) |
|---|---|---|
| Trainee | Fixed bottom nav (3 tabs: Home, Bookings, Profile) | Inline topbar nav, content max 72rem |
| Trainer | Fixed bottom tab bar (3 tabs) | 13.5rem left sidebar, content fills remaining |
| Admin | Sticky topbar (brand) + fixed bottom nav | 13.5rem left sidebar, topbar hidden |

- CSS variable `--bottom-nav-height: 3.5rem` is used to offset page content on mobile.
- Auth pages (`/login`, `/signup`) are standalone (no shell). On mobile: compact inline brand row above the form. On desktop: two-column grid — brand panel on the left, form centered on the right.

## Booking Flow

Booking and payment are handled in a single atomic call:

1. Trainee browses trainers on `/trainee/home` (filtered by search + specialty chips)
2. Trainee opens trainer detail at `/trainee/trainer/:id` — sees bio, specialties, years of experience, and available sessions. Each session shows its total **capacity**. Sessions with `status !== 'available'` (e.g. `booked`, `completed`, `cancelled`) are **disabled** — greyed out, not clickable, and display their status label instead of capacity.
3. Trainee selects an available session and clicks **Book Session** — navigates directly to `/payment` with query params: `sessionId`, `trainerName`, `sessionTime`, `amount`
4. Payment page calls `POST /api/v1/bookings/pay` (`BookAndPayRequest: { session_id, amount, payment_method }`) in one step
5. On `status === 'paid'` response, navigates to `/trainee/bookings` with router state `{ bookingConfirmed: true }` — the bookings page shows a success banner and lists all confirmed bookings

### Payment route query params

| Param | Source | Used for |
|---|---| ---|
| `sessionId` | `session.id` | Passed to `PaymentService.bookAndPay` |
| `trainerName` | `trainer_first_name + trainer_last_name` | Display only |
| `sessionTime` | `session.session_time` | Parsed to show date/time in payment summary |
| `amount` | `session.price` (exact value set by the trainer; `0` = free session) | Price shown and charged |

## Session Editing

- **Trainers** can edit their own sessions (time, capacity, status) via `PATCH /api/v1/sessions/:id` through `SessionService.updateSession()`.
- **Trainers** can delete a session only when `status === 'available'` (no bookings). Delete button is disabled otherwise.
- **Admins** can edit any session (time, capacity, status) via `PUT /api/v1/admin/sessions/:id` through `AdminService.updateSession()`.
- **Admins** can delete any session via `DELETE /api/v1/sessions/:id` through `AdminService.deleteSession()`.
- Session status values: `'available' | 'booked' | 'completed' | 'cancelled'`.
- Sessions with `price = 0` are displayed as **"Free"** in the UI. Trainers should set a price when creating or editing a session.

## Responsibility By Layer

- `core/` — Singleton infrastructure: HTTP interceptor, route guards, auth service, API service, constants. No feature-specific logic.
- `features/` — Business domains. Each feature owns its pages, models, and services. Features do not import from each other.
- `shared/` — Generic, reusable UI primitives with no business coupling. Never imports from features.
- `styles/` — Design tokens in `abstracts/_variables.scss`, theme overrides in `themes/_dark-neon.scss`.
- `assets/` — Static files: fonts, icons, images, branding.
- `environments/` — Build-time environment configs.

## Payment Page UI

The payment page (`features/checkout/pages/payment/`) is a standalone page (no shell) guarded by `authGuard`. It is composed of two surface cards:

- **Session summary card** — trainer mini-card with avatar + specialty, booking overview table (session, date, time, total price row highlighted with neon gradient)
- **Card information card** — labelled form fields for cardholder name, card number, expiry, CVV with hover/focus neon glow, inline validation errors, total-due panel, and a sticky `Pay Now` CTA on mobile

On desktop (≥ 48rem) the two cards sit side by side in a `1fr / 1.4fr` grid. The CTA becomes static (no longer fixed).

All SCSS in `payment.page.scss` uses only CSS custom properties from `_variables.scss`. No hardcoded hex values. Shared alert styles (success/error boxes) are deduplicated with a `%alert-base` SCSS placeholder.

## Rules For Scalability

- Keep feature code inside its own folder. Cross-feature dependencies must go through `shared/` or `core/`.
- Keep `core/` free of feature-specific business logic.
- All new pages use standalone components with `ChangeDetectionStrategy.OnPush`.
- Use `signal()` and `computed()` for reactive state instead of `BehaviorSubject`.
- Use `toSignal()` to bridge RxJS observables into the signal graph.
- Load pages lazily via `loadComponent` in `app.routes.ts`.
- Store all design tokens in `styles/abstracts/_variables.scss` — no hardcoded hex values in component SCSS.
