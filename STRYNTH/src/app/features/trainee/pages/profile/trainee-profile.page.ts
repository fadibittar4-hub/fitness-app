import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { BookingService } from '../../../booking/services/booking.service';
import { Booking } from '../../../booking/models/booking.models';
import { AvatarUploadComponent } from '../../../../shared/components/ui/avatar-upload/avatar-upload.component';

@Component({
  selector: 'trainee-profile-page',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, AvatarUploadComponent],
  templateUrl: './trainee-profile.page.html',
  styleUrls: ['./trainee-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeProfilePage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);

  readonly bookings = signal<Booking[]>([]);
  readonly isLoadingBookings = signal(false);

  ngOnInit(): void {
    this.isLoadingBookings.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.isLoadingBookings.set(false);
        this.bookings.set(res.data.filter((b) => b.status === 'confirmed'));
      },
      error: () => {
        this.isLoadingBookings.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
