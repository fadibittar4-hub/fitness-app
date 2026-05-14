import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ApiResponse } from '../../../core/models/api.models';
import { BookAndPayRequest, BookAndPayResponse } from '../../booking/models/booking.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  bookAndPay(request: BookAndPayRequest): Observable<ApiResponse<BookAndPayResponse>> {
    return this.api.post<BookAndPayResponse>(API_ENDPOINTS.BOOKINGS.PAY, request);
  }
}
