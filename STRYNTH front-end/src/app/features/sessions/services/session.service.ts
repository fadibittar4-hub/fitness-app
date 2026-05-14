import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { CreateSessionRequest, Session, UpdateSessionRequest } from '../models/session.models';
import { ApiResponse } from '../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiService);

  getAvailableSessions(): Observable<ApiResponse<Session[]>> {
    return this.api.get<Session[]>(API_ENDPOINTS.SESSIONS.AVAILABLE);
  }

  getTrainerSessions(): Observable<ApiResponse<Session[]>> {
    return this.api.get<Session[]>(API_ENDPOINTS.SESSIONS.TRAINER);
  }

  createSession(request: CreateSessionRequest): Observable<ApiResponse<Session>> {
    return this.api.post<Session>(API_ENDPOINTS.SESSIONS.CREATE, request);
  }

  updateSession(id: number, request: UpdateSessionRequest): Observable<ApiResponse<Session>> {
    return this.api.patch<Session>(API_ENDPOINTS.SESSIONS.UPDATE(id), request);
  }

  deleteSession(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.SESSIONS.DELETE(id));
  }
}
