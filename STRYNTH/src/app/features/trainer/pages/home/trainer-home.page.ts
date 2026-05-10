import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { BookingService } from '../../../booking/services/booking.service';
import { SessionService } from '../../../sessions/services/session.service';
import { Booking } from '../../../booking/models/booking.models';
import { Session } from '../../../sessions/models/session.models';

@Component({
  selector: 'trainer-home-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './trainer-home.page.html',
  styleUrls: ['./trainer-home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerHomePage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly sessionService = inject(SessionService);

  readonly bookings = signal<Booking[]>([]);
  readonly sessions = signal<Session[]>([]);
  readonly isLoading = signal(false);

  readonly totalBookings = computed(() => this.bookings().length);
  readonly upcomingBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'confirmed'),
  );
  readonly upcomingSessions = computed(() =>
    this.sessions().filter((s) => s.status === 'available'),
  );

  ngOnInit(): void {
    this.isLoading.set(true);

    this.bookingService.getTrainerBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });

    this.sessionService.getTrainerSessions().subscribe({
      next: (res) => {
        this.sessions.set(res.data);
      },
      error: () => {},
    });
  }
}
