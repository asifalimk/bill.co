import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const ADMIN_ROUTES = new Set(['/inventory', '/purchases', '/vendors', '/returns', '/settings']);

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private readonly auth = inject(AuthService);

  canActivatePath(path: string): boolean {
    if (!this.auth.isAuthenticated()) {
      this.redirect('/login');
      return false;
    }

    const routePath = path.split('?')[0];
    if (ADMIN_ROUTES.has(routePath) && !this.auth.isAdmin()) {
      this.redirect('/pos');
      return false;
    }
    return true;
  }

  private redirect(path: string): void {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.replaceState({}, '', path);
    }
  }
}
