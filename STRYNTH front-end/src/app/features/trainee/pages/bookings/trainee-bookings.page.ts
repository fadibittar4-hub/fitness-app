import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../booking/services/booking.service';
import { Booking } from '../../../booking/models/booking.models';

@Component({
  selector: 'trainee-bookings-page',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './trainee-bookings.page.html',
  styleUrls: ['./trainee-bookings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeBookingsPage implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  readonly bookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly justPaid = signal(false);

  ngOnInit(): void {
    const navState = history.state as Record<string, unknown>;
    if (navState?.['bookingConfirmed']) {
      this.justPaid.set(true);
    }
    this.loadBookings();
  }

  private loadBookings(): void {
    this.isLoading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.loadError.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  dismissBanner(): void {
    this.justPaid.set(false);
  }

  goHome(): void {
    void this.router.navigate(['/trainee/home']);
  }
}
