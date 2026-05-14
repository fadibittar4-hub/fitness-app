import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ApiResponse } from '../../../core/models/api.models';
import { Booking } from '../../booking/models/booking.models';
import { Session, UpdateSessionRequest } from '../../sessions/models/session.models';

export interface AdminStats {
  total_users: number;
  total_trainers: number;
  total_bookings: number;
  confirmed_bookings: number;
  total_sessions: number;
  available_sessions: number;
  completed_sessions: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  users: AdminUser[];
  bookings: Booking[];
  sessions: Session[];
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'member' | 'trainee' | 'trainer' | 'admin';
  created_at: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'member' | 'trainer' | 'admin';
}

export interface UpdateTrainerProfileRequest {
  description?: string;
  specialties?: string;
  years_experience?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  getStats(): Observable<AdminDashboardData> {
    return forkJoin({
      users: this.getAllUsers(),
      bookings: this.getAllBookings(),
      sessions: this.getAllSessions(),
    }).pipe(
      map(({ users, bookings, sessions }) => ({
        stats: {
          total_users: users.data.filter(u => u.role === 'trainee').length,
          total_trainers: users.data.filter(u => u.role === 'trainer').length,
          total_bookings: bookings.data.length,
          confirmed_bookings: bookings.data.filter(b => b.status === 'confirmed').length,
          total_sessions: sessions.data.length,
          available_sessions: sessions.data.filter(s => s.status === 'available').length,
          completed_sessions: sessions.data.filter(s => s.status === 'completed').length,
        },
        users: users.data,
        bookings: bookings.data,
        sessions: sessions.data,
      }))
    );
  }

  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.api.get<Booking[]>(API_ENDPOINTS.ADMIN.BOOKINGS);
  }

  getAllSessions(): Observable<ApiResponse<Session[]>> {
    return this.api.get<Session[]>(API_ENDPOINTS.ADMIN.SESSIONS);
  }

  getAllUsers(): Observable<ApiResponse<AdminUser[]>> {
    return this.api.get<AdminUser[]>(API_ENDPOINTS.ADMIN.USERS);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<ApiResponse<AdminUser>> {
    return this.api.put<AdminUser>(API_ENDPOINTS.ADMIN.UPDATE_USER(id), request);
  }

  updateTrainerProfile(id: number, request: UpdateTrainerProfileRequest): Observable<ApiResponse<AdminUser>> {
    return this.api.put<AdminUser>(API_ENDPOINTS.ADMIN.UPDATE_TRAINER_PROFILE(id), request);
  }

  updateSession(id: number, request: UpdateSessionRequest): Observable<ApiResponse<Session>> {
    return this.api.put<Session>(API_ENDPOINTS.ADMIN.UPDATE_SESSION(id), request);
  }

  deleteSession(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.SESSIONS.DELETE(id));
  }
}
