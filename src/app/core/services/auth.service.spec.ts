import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function createAuthService(http: object): AuthService {
    const injector = Injector.create({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: http },
      ],
    });
    return injector.get(AuthService);
  }

  it('logs in through the API and stores the returned token and profile', async () => {
    const post = jest.fn().mockReturnValue(of({
      access_token: 'signed-token',
      user: { id: 1, username: 'admin', name: 'Store Admin', role: 'ADMIN' },
    }));
    const service = createAuthService({ post });

    await service.login('admin', 'a-secure-password');

    expect(post).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'a-secure-password',
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.currentUser()?.displayName).toBe('Store Admin');
    expect(localStorage.getItem('hardware-counter-access-token')).toBe('signed-token');
  });

  it('validates a stored token with the API before restoring the user', async () => {
    localStorage.setItem('hardware-counter-access-token', 'stored-token');
    const get = jest.fn().mockReturnValue(of({
      id: 3,
      username: 'cashier',
      name: 'Cashier',
      role: 'CASHIER',
    }));
    const service = createAuthService({ get });

    await firstValueFrom(service.restoreSession());

    expect(get).toHaveBeenCalledWith(`${API_BASE_URL}/auth/me`);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('adds the bearer token to API requests and clears the session after a 401', async () => {
    localStorage.setItem('hardware-counter-access-token', 'stored-token');
    const service = createAuthService({});
    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: service },
      ],
    });
    let sentRequest: HttpRequest<unknown> | undefined;
    const handler = jest.fn((request: HttpRequest<unknown>) => {
      sentRequest = request;
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    });
    const request = new HttpRequest('GET', `${API_BASE_URL}/items`);

    await expect(firstValueFrom(runInInjectionContext(
      injector,
      () => authInterceptor(request, handler),
    ))).rejects.toMatchObject({ status: 401 });

    expect(sentRequest?.headers.get('Authorization')).toBe('Bearer stored-token');
    expect(service.token()).toBeNull();
    expect(localStorage.getItem('hardware-counter-access-token')).toBeNull();
  });

  it('clears the stored token and current user when logging out', async () => {
    const post = jest.fn().mockReturnValue(of({
      access_token: 'signed-token',
      user: { id: 1, username: 'admin', name: 'Store Admin', role: 'ADMIN' },
    }));
    const service = createAuthService({ post });
    await service.login('admin', 'a-secure-password');

    service.clearSession(false);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('hardware-counter-access-token')).toBeNull();
  });
});
