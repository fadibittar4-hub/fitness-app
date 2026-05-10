import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Booking } from '../../../booking/models/booking.models';

@Component({
  selector: 'admin-bookings-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './admin-bookings.page.html',
  styleUrls: ['./admin-bookings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBookingsPage implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly bookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.isLoading.set(true);
    this.adminService.getAllBookings().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.bookings.set(res.data);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set(err.message);
      },
    });
  }
}
