import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Booking } from '../models/booking.models';
import { ApiResponse } from '../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiService);
  getMyBookings(): Observable<ApiResponse<Booking[]>> {
    return this.api.get<Booking[]>(API_ENDPOINTS.BOOKINGS.MY);
  }

  getTrainerBookings(): Observable<ApiResponse<Booking[]>> {
    return this.api.get<Booking[]>(API_ENDPOINTS.BOOKINGS.TRAINER);
  }
}
