import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import type {
  CompletarPerfilAdministrativoRequest,
  CompletarPerfilAlumnoRequest,
  CompletarPerfilCreadorRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  User,
} from '../../models';

const TOKEN_KEY = 'tdi_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http: HttpClient;

  readonly #token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly #currentUser = signal<User | null>(null);

  readonly token = this.#token.asReadonly();
  readonly currentUser = this.#currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.#token() !== null);

  readonly token$ = toObservable(this.#token);

  constructor(http: HttpClient) {
    this.http = http;
    if (this.#token()) {
      setTimeout(() => {
        this.getCurrentUser().subscribe({
          next: (user) => this.#currentUser.set(user),
          error: () => this.logout(),
        });
      }, 0);
    }
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/users/login`, credentials);
  }

  register(data: RegisterRequest) {
    return this.http.post<MessageResponse>(`${environment.apiBaseUrl}/api/users/register`, data);
  }

  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    this.#token.set(token);
    this.#currentUser.set(user);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.#token.set(null);
    this.#currentUser.set(null);
  }

  getCurrentUser() {
    return this.http.get<User>(`${environment.apiBaseUrl}/api/users/me`);
  }

  completarPerfilAlumno(data: CompletarPerfilAlumnoRequest) {
    return this.http.post<MessageResponse>(
      `${environment.apiBaseUrl}/api/users/alumnos/completar-perfil`,
      data,
    );
  }

  completarPerfilAdministrativo(data: CompletarPerfilAdministrativoRequest) {
    return this.http.post<MessageResponse>(
      `${environment.apiBaseUrl}/api/users/administrativos/completar-perfil`,
      data,
    );
  }

  completarPerfilCreador(data: CompletarPerfilCreadorRequest) {
    return this.http.post<MessageResponse>(
      `${environment.apiBaseUrl}/api/users/creadores/completar-perfil`,
      data,
    );
  }

  refreshCurrentUser() {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.#currentUser.set(user);
      },
    });
  }

  deleteUser(id: string) {
    return this.http.delete<MessageResponse>(`${environment.apiBaseUrl}/api/users/users/${id}`);
  }
}
