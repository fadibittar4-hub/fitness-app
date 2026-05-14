import { Routes } from '@angular/router';
import { authGuard, trainerGuard, traineeGuard, adminGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // ── Root redirect ────────────────────────────────────────
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  // ── Auth ─────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/pages/register/signup.page').then((m) => m.SignupPage),
  },

  // ── Trainee shell ─────────────────────────────────────────
  {
    path: 'trainee',
    canActivate: [authGuard, traineeGuard],
    loadComponent: () =>
      import('./features/trainee/shell/trainee-shell.component').then(
        (m) => m.TraineeShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/trainee/pages/home/trainee-home.page').then(
            (m) => m.TraineeHomePage,
          ),
      },
      {
        path: 'trainer/:id',
        loadComponent: () =>
          import('./features/trainee/pages/trainer-detail/trainer-detail.page').then(
            (m) => m.TrainerDetailPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/trainee/pages/profile/trainee-profile.page').then(
            (m) => m.TraineeProfilePage,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/trainee/pages/bookings/trainee-bookings.page').then(
            (m) => m.TraineeBookingsPage,
          ),
      },
    ],
  },

  // ── Trainer shell ─────────────────────────────────────────
  {
    path: 'trainer',
    canActivate: [authGuard, trainerGuard],
    loadComponent: () =>
      import('./features/trainer/shell/trainer-shell.component').then(
        (m) => m.TrainerShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/trainer/pages/home/trainer-home.page').then(
            (m) => m.TrainerHomePage,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/sessions/pages/manage/manage-sessions.page').then(
            (m) => m.ManageSessionsPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/trainer/pages/profile/trainer-profile.page').then(
            (m) => m.TrainerProfilePage,
          ),
      },
    ],
  },

  // ── Admin shell ───────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/shell/admin-shell.component').then(
        (m) => m.AdminShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/admin/pages/home/admin-home.page').then(
            (m) => m.AdminHomePage,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/pages/bookings/admin-bookings.page').then(
            (m) => m.AdminBookingsPage,
          ),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/admin/pages/sessions/admin-sessions.page').then(
            (m) => m.AdminSessionsPage,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/users/admin-users.page').then(
            (m) => m.AdminUsersPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/admin/pages/profile/admin-profile.page').then(
            (m) => m.AdminProfilePage,
          ),
      },
    ],
  },

  // ── Payment (standalone, post-booking) ───────────────────
  {
    path: 'payment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/pages/payment/payment.page').then(
        (m) => m.PaymentPage,
      ),
  },

  // ── Fallback ──────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'login',
  },
];