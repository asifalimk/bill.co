import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'CASHIER';
export interface User {
  username: string;
  displayName: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  login(username: string, password: string, pin: string): boolean {
    const normalized = username.trim().toLowerCase();
    if (normalized === 'admin' && password === 'admin123') {
      this.user.set({ username: normalized, displayName: 'Alex Morgan', role: 'ADMIN' });
      return true;
    }
    if (normalized === 'cashier' && (pin === '1234' || password === '1234')) {
      this.user.set({ username: normalized, displayName: 'Sam Taylor', role: 'CASHIER' });
      return true;
    }
    return false;
  }

  logout(): void {
    this.user.set(null);
  }
}
