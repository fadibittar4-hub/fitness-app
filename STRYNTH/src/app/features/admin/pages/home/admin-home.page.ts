import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { AdminService, AdminStats, AdminUser, UpdateUserRequest } from '../../services/admin.service';
import { Booking } from '../../../booking/models/booking.models';
import { Session } from '../../../sessions/models/session.models';

type PanelType =
  | 'trainees'
  | 'trainers'
  | 'sessions'
  | 'available_sessions'
  | 'completed_sessions'
  | 'bookings'
  | 'confirmed_bookings';

const PANEL_LABELS: Record<PanelType, string> = {
  trainees: 'Trainees',
  trainers: 'Trainers',
  sessions: 'All Sessions',
  available_sessions: 'Available Sessions',
  completed_sessions: 'Completed Sessions',
  bookings: 'All Bookings',
  confirmed_bookings: 'Confirmed Bookings',
};

@Component({
  selector: 'admin-home-page',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, DatePipe],
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomePage implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly stats = computed<AdminStats | null>(() => {
    const users = this.rawUsers();
    const bookings = this.rawBookings();
    const sessions = this.rawSessions();
    if (!users.length && !bookings.length && !sessions.length) return null;
    return {
      total_users: users.filter(u => u.role === 'trainee').length,
      total_trainers: users.filter(u => u.role === 'trainer').length,
      total_bookings: bookings.length,
      confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
      total_sessions: sessions.length,
      available_sessions: sessions.filter(s => s.status === 'available').length,
      completed_sessions: sessions.filter(s => s.status === 'completed').length,
    };
  });
  readonly isLoading = signal(false);
  readonly error = signal('');

  private readonly rawUsers = signal<AdminUser[]>([]);
  private readonly rawBookings = signal<Booking[]>([]);
  private readonly rawSessions = signal<Session[]>([]);

  readonly activePanel = signal<PanelType | null>(null);

  // ── User editing ────────────────────────────────────────────────
  readonly editingUserId = signal<number | null>(null);
  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editEmail = signal('');
  readonly editRole = signal<'member' | 'trainer' | 'admin'>('member');
  readonly isSavingUser = signal(false);
  readonly userSaveError = signal('');
  readonly userRoleOptions: Array<'member' | 'trainer' | 'admin'> = ['member', 'trainer', 'admin'];

  // ── Session editing ─────────────────────────────────────────────
  readonly editingSessionId = signal<number | null>(null);
  readonly editSessionTime = signal('');
  readonly editSessionCapacity = signal(1);
  readonly editSessionStatus = signal<Session['status']>('available');
  readonly editSessionPrice = signal<number>(0);
  readonly isSavingSession = signal(false);
  readonly sessionSaveError = signal('');
  readonly confirmDeleteSessionId = signal<number | null>(null);
  readonly deletingSessionId = signal<number | null>(null);
  readonly sessionStatusOptions: Session['status'][] = ['available', 'booked', 'completed', 'cancelled'];

  // ── No booking cancel ────────────────────────────────────────────

  readonly panelTitle = computed(() =>
    this.activePanel() ? PANEL_LABELS[this.activePanel()!] : ''
  );

  readonly isUserPanel = computed(() => {
    const p = this.activePanel();
    return p === 'trainees' || p === 'trainers';
  });

  readonly isSessionPanel = computed(() => {
    const p = this.activePanel();
    return p === 'sessions' || p === 'available_sessions' || p === 'completed_sessions';
  });

  readonly isBookingPanel = computed(() => {
    const p = this.activePanel();
    return p === 'bookings' || p === 'confirmed_bookings';
  });

  readonly panelUsers = computed(() => {
    const p = this.activePanel();
    if (p === 'trainees') return this.rawUsers().filter(u => u.role === 'trainee');
    if (p === 'trainers') return this.rawUsers().filter(u => u.role === 'trainer');
    return [];
  });

  readonly panelSessions = computed(() => {
    const p = this.activePanel();
    if (p === 'sessions') return this.rawSessions();
    if (p === 'available_sessions') return this.rawSessions().filter(s => s.status === 'available');
    if (p === 'completed_sessions') return this.rawSessions().filter(s => s.status === 'completed');
    return [];
  });

  readonly panelBookings = computed(() => {
    const p = this.activePanel();
    if (p === 'bookings') return this.rawBookings();
    if (p === 'confirmed_bookings') return this.rawBookings().filter(b => b.status === 'confirmed');
    return [];
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.rawUsers.set(data.users);
        this.rawBookings.set(data.bookings);
        this.rawSessions.set(data.sessions);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set(err.message);
      },
    });
  }

  selectPanel(panel: PanelType): void {
    this.activePanel.set(this.activePanel() === panel ? null : panel);
  }

  closePanel(): void {
    this.activePanel.set(null);
  }

  // ── User actions ─────────────────────────────────────────────────
  startEditUser(u: AdminUser): void {
    this.editingUserId.set(u.id);
    this.editFirstName.set(u.first_name);
    this.editLastName.set(u.last_name);
    this.editEmail.set(u.email);
    this.editRole.set(u.role === 'trainee' ? 'member' : u.role as 'member' | 'trainer' | 'admin');
    this.userSaveError.set('');
  }

  cancelEditUser(): void {
    this.editingUserId.set(null);
    this.userSaveError.set('');
  }

  saveEditUser(): void {
    const id = this.editingUserId();
    if (id === null) return;
    this.isSavingUser.set(true);
    this.userSaveError.set('');
    const req: UpdateUserRequest = {
      first_name: this.editFirstName(),
      last_name: this.editLastName(),
      email: this.editEmail(),
      role: this.editRole(),
    };
    this.adminService.updateUser(id, req).subscribe({
      next: (res) => {
        this.isSavingUser.set(false);
        this.rawUsers.update(prev => prev.map(u => u.id === id ? res.data : u));
        this.editingUserId.set(null);
      },
      error: (err: Error) => {
        this.isSavingUser.set(false);
        this.userSaveError.set(err.message);
      },
    });
  }

  // ── Session actions ───────────────────────────────────────────────
  startEditSession(s: Session): void {
    this.editingSessionId.set(s.id);
    this.editSessionTime.set(new Date(s.session_time).toISOString().slice(0, 16));
    this.editSessionCapacity.set(s.capacity);
    this.editSessionStatus.set(s.status);
    this.editSessionPrice.set(s.price);
    this.sessionSaveError.set('');
    this.confirmDeleteSessionId.set(null);
  }

  cancelEditSession(): void {
    this.editingSessionId.set(null);
    this.sessionSaveError.set('');
  }

  saveEditSession(): void {
    const id = this.editingSessionId();
    if (id === null) return;
    this.isSavingSession.set(true);
    this.sessionSaveError.set('');
    this.adminService.updateSession(id, {
      session_time: new Date(this.editSessionTime()).toISOString(),
      capacity: this.editSessionCapacity(),
      status: this.editSessionStatus(),
      price: this.editSessionPrice(),
    }).subscribe({
      next: (res) => {
        this.isSavingSession.set(false);
        this.rawSessions.update(prev => prev.map(s => s.id === id ? res.data : s));
        this.editingSessionId.set(null);
      },
      error: (err: Error) => {
        this.isSavingSession.set(false);
        this.sessionSaveError.set(err.message);
      },
    });
  }

  requestDeleteSession(id: number): void {
    this.confirmDeleteSessionId.set(id);
  }

  cancelDeleteSession(): void {
    this.confirmDeleteSessionId.set(null);
  }

  confirmDeleteSession(id: number): void {
    this.deletingSessionId.set(id);
    this.confirmDeleteSessionId.set(null);
    this.adminService.deleteSession(id).subscribe({
      next: () => {
        this.deletingSessionId.set(null);
        this.rawSessions.update(prev => prev.filter(s => s.id !== id));
      },
      error: () => { this.deletingSessionId.set(null); },
    });
  }
}
