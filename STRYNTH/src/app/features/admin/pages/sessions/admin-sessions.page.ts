import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Session } from '../../../sessions/models/session.models';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'admin-sessions-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, FormsModule, ButtonComponent],
  templateUrl: './admin-sessions.page.html',
  styleUrls: ['./admin-sessions.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSessionsPage implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly sessions = signal<Session[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly editingId = signal<number | null>(null);
  readonly editTime = signal('');
  readonly editCapacity = signal(1);
  readonly editStatus = signal<Session['status']>('available');
  readonly isSaving = signal(false);
  readonly saveError = signal('');

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
