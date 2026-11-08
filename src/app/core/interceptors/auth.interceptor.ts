import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const token = isApiRequest ? auth.token() : null;
  const authorizedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      const isLoginRequest = request.url.startsWith(`${API_BASE_URL}/auth/login`);
      if (isApiRequest && !isLoginRequest &&
          error instanceof HttpErrorResponse && error.status === 401) {
        auth.clearSession();
      }
      return throwError(() => error);
    }),
  );
};
