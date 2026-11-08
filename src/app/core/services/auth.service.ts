import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom, Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type UserRole = 'ADMIN' | 'CASHIER';

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
}

interface ApiUser {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

interface LoginResponse {
  access_token: string;
  user: ApiUser;
}

const TOKEN_STORAGE_KEY = 'hardware-counter-access-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly token = signal(this.readStorage(TOKEN_STORAGE_KEY));
  readonly currentUser = signal<User | null>(null);
  readonly isRestoring = signal(this.token() !== null);
  readonly isAuthenticated = computed(() => this.token() !== null && this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
        username: username.trim(),
        password,
      }),
    );
    if (!response.access_token) {
      throw new Error('The authentication server did not return an access token.');
    }
    const user = this.mapUser(response.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
    this.token.set(response.access_token);
    this.currentUser.set(user);
  }

  restoreSession(): Observable<User | null> {
    const token = this.token();
    if (!token) {
      this.isRestoring.set(false);
      return of(null);
    }

    this.isRestoring.set(true);
    return this.http.get<ApiUser>(`${API_BASE_URL}/auth/me`).pipe(
      map(apiUser => this.mapUser(apiUser)),
      tap(user => this.currentUser.set(user)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.clearSession(false);
          return of(null);
        }
        return throwError(() => error);
      }),
      finalize(() => this.isRestoring.set(false)),
    );
  }

  clearSession(redirectToLogin = true): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    if (redirectToLogin && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
  }

  logout(): void {
    this.clearSession();
  }

  private mapUser(user: ApiUser): User {
    if (!Number.isInteger(user.id) || !user.username || !user.name ||
        (user.role !== 'ADMIN' && user.role !== 'CASHIER')) {
      throw new Error('The authentication server returned an invalid user profile.');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.name,
      role: user.role,
    };
  }

  private readStorage(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }
}
