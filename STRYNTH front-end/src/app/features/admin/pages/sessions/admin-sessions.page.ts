import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Session } from '../../../sessions/models/session.models';
import { Booking } from '../../../booking/models/booking.models';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SessionBookersComponent } from '../../../../shared/components/ui/session-bookers/session-bookers.component';

@Component({
  selector: 'admin-sessions-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, FormsModule, ButtonComponent, SessionBookersComponent],
  templateUrl: './admin-sessions.page.html',
  styleUrls: ['./admin-sessions.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSessionsPage implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly sessions = signal<Session[]>([]);
  readonly allBookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly editingId = signal<number | null>(null);
  readonly editTime = signal('');
  readonly editCapacity = signal(1);
  readonly editStatus = signal<Session['status']>('available');
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

  ngOnInit(): void {
    this.isLoading.set(true);
    this.adminService.getAllSessions().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.sessions.set(res.data);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set(err.message);
      },
    });
    this.adminService.getAllBookings().subscribe({
      next: (res) => this.allBookings.set(res.data),
      error: () => {},
    });
  }

  toggleBookers(sessionId: number): void {
    this.expandedSessionId.set(
      this.expandedSessionId() === sessionId ? null : sessionId,
    );
  }

  startEdit(session: Session): void {
    this.editingId.set(session.id);
    // datetime-local input requires YYYY-MM-DDTHH:mm
    this.editTime.set(new Date(session.session_time).toISOString().slice(0, 16));
    this.editCapacity.set(session.capacity);
    this.editStatus.set(session.status);
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

    this.adminService
      .updateSession(id, {
        session_time: new Date(this.editTime()).toISOString(),
        capacity: this.editCapacity(),
        status: this.editStatus(),
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
}
