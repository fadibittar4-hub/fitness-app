import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string): Observable<ApiResponse<T>> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`)
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http
      .patch<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  patchForm<T>(path: string, body: FormData): Observable<ApiResponse<T>> {
    return this.http
      .patch<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${path}`, { responseType: 'text' as 'json' })
      .pipe(
        map((body) => {
          const text = body as unknown as string;
          if (!text || text.trim() === '') {
            return { success: true, data: null as T };
          }
          return JSON.parse(text) as ApiResponse<T>;
        }),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const serverMessage = error.error?.message || error.error?.error;
    const statusMessage = ApiService.statusMessage(error.status);
    const message = serverMessage || statusMessage;
    return throwError(() => new Error(message));
  }

  private static statusMessage(status: number): string {
    switch (status) {
      case 0:   return 'Connection error. Please try again later.';
      case 400: return 'Invalid request. Please check your details.';
      case 401: return 'Incorrect email or password.';
      case 403: return 'You do not have permission to do that.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'A conflict occurred. Please try again.';
      case 422: return 'Some fields are invalid. Please check your input.';
      case 429: return 'Too many attempts. Please wait a moment and try again.';
      case 500: return 'Something went wrong on our end. Please try again later.';
      default:  return 'An unexpected error occurred. Please try again.';
    }
  }
}
