import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from '../../features/auth/models/auth.models';
import { ApiResponse } from '../models/api.models';

const TOKEN_KEY = 'strynth_token';
const USER_KEY = 'strynth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly _user = signal<User | null>(this.restoreUser());

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isTrainer = computed(() => this._user()?.role === 'trainer');
  readonly isTrainee = computed(() => this._user()?.role === 'trainee');
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api
      .post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        tap((res) => {
          if (res.success) {
            localStorage.setItem(TOKEN_KEY, res.data.access_token);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            this._user.set(res.data.user);
          }
        }),
      );
  }

  signup(request: SignupRequest): Observable<ApiResponse<User>> {
    return this.api.post<User>(API_ENDPOINTS.AUTH.SIGNUP, request);
  }

  uploadProfileImage(file: File): Observable<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('profile_image', file);
    return this.api.patchForm<User>(API_ENDPOINTS.AUTH.PROFILE_IMAGE, formData).pipe(
      tap((res) => {
        if (res.success) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          this._user.set(res.data);
        }
      }),
    );
  }

  logout(): void {
    this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({ error: () => {} });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private restoreUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
