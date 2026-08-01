import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const publicPaths = ['/api/users/login', '/api/users/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  const isPublic = publicPaths.some((path) => req.url.includes(path));
  const isExternal = !req.url.startsWith('http://127.0.0.1:8080') && !req.url.startsWith('/api');

  const isRevision = req.url.includes('/api/tdi/revisiones/');
  const user = authService.currentUser();

  if (token && !isPublic && !isExternal) {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (isRevision && user) {
      headers['X-User-Role'] = user.role;
    }
    req = req.clone({ setHeaders: headers });
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !isPublic) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
