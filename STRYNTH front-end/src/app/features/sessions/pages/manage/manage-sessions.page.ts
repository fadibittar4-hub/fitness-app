import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { SessionBookersComponent } from '../../../../shared/components/ui/session-bookers/session-bookers.component';
import { SessionService } from '../../services/session.service';
import { Session } from '../../models/session.models';
import { BookingService } from '../../../booking/services/booking.service';
import { Booking } from '../../../booking/models/booking.models';

type SessionTone = 'primary' | 'success' | 'neutral';

@Component({
  selector: 'sessions-manage-page',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, CurrencyPipe, DatePipe, FormsModule, ButtonComponent, BadgeComponent, SessionBookersComponent],
  templateUrl: './manage-sessions.page.html',
  styleUrls: ['./manage-sessions.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageSessionsPage implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly bookingService = inject(BookingService);

  readonly sessions = signal<Session[]>([]);
  readonly allBookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly isCreating = signal(false);
  readonly createError = signal('');
  readonly createSuccess = signal('');
  readonly isDeletingId = signal<number | null>(null);
  readonly deleteError = signal('');

  // Edit state
  readonly editingId = signal<number | null>(null);
  readonly editTime = signal('');
  readonly editCapacity = signal(1);
  readonly editStatus = signal<Session['status']>('available');
  readonly editPrice = signal<number>(0);
  readonly isSaving = signal(false);
  readonly saveError = signal('');

  readonly expandedSessionId = signal<number | null>(null);

  readonly bookersBySession = computed(() => {
    const map = new Map<number, Booking[]>();
    for (const b of this.allBookings()) {
      const list = map.get(b.session_id) ?? [];
      list.push(b);
      map.set(b.session_id, list);
    }
    return map;
  });

  readonly statusOptions: Session['status'][] = ['available', 'booked', 'completed', 'cancelled'];

  // Form field signals
  readonly newSessionTime = signal('');
  readonly newCapacity = signal(1);
  readonly newPrice = signal<number>(0);

  /** Minimum ISO slice for the datetime-local input (one hour from now). */
  readonly minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  ngOnInit(): void {
    this.loadSessions();
    this.bookingService.getTrainerBookings().subscribe({
      next: (res) => this.allBookings.set(res.data),
      error: () => {},
    });
  }

  toggleBookers(sessionId: number): void {
    this.expandedSessionId.set(
      this.expandedSessionId() === sessionId ? null : sessionId,
    );
  }

  createSession(form: NgForm): void {
    if (form.invalid || !this.newSessionTime()) return;

    this.isCreating.set(true);
    this.createError.set('');
    this.createSuccess.set('');

    this.sessionService
      .createSession({
        session_time: new Date(this.newSessionTime()).toISOString(),
        capacity: this.newCapacity(),
        price: this.newPrice(),
      })
      .subscribe({
        next: (res) => {
          this.isCreating.set(false);
          this.createSuccess.set('Session created successfully.');
          this.sessions.update((prev) => [res.data, ...prev]);
          form.resetForm();
          this.newSessionTime.set('');
          this.newCapacity.set(1);
          this.newPrice.set(0);
        },
        error: (err: Error) => {
          this.isCreating.set(false);
          this.createError.set(err.message);
        },
      });
  }

  startEdit(session: Session): void {
    this.editingId.set(session.id);
    this.editTime.set(new Date(session.session_time).toISOString().slice(0, 16));
    this.editCapacity.set(session.capacity);
    this.editStatus.set(session.status);
    this.editPrice.set(session.price);
    this.saveError.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.saveError.set('');
  }

  saveEdit(form: NgForm): void {
    if (form.invalid) return;
    const id = this.editingId();
    if (id === null) return;

    this.isSaving.set(true);
    this.saveError.set('');

    this.sessionService
      .updateSession(id, {
        session_time: new Date(this.editTime()).toISOString(),
        capacity: this.editCapacity(),
        status: this.editStatus(),
        price: this.editPrice(),
      })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.sessions.update((prev) =>
            prev.map((s) => (s.id === id ? res.data : s)),
          );
          this.editingId.set(null);
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.saveError.set(err.message);
        },
      });
  }

  deleteSession(id: number): void {
    this.isDeletingId.set(id);
    this.deleteError.set('');

    this.sessionService.deleteSession(id).subscribe({
      next: () => {
        this.isDeletingId.set(null);
        this.sessions.update((prev) => prev.filter((s) => s.id !== id));
      },
      error: (err: Error) => {
        this.isDeletingId.set(null);
        this.deleteError.set(err.message);
      },
    });
  }

  statusTone(status: Session['status']): SessionTone {
    if (status === 'available') return 'primary';
    if (status === 'booked' || status === 'completed') return 'success';
    return 'neutral';
  }

  private loadSessions(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.sessionService.getTrainerSessions().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.sessions.set(res.data);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.loadError.set(err.message);
      },
    });
  }
}
