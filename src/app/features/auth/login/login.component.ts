import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

import { ROLE_ROUTES } from '../../../core/config/role-routes';

// TODO: nombre del proyecto pendiente

const LOGO_URL = '/logo.png';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Message, Password],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  protected readonly logoUrl = LOGO_URL;

  protected readonly loading = signal(false);
  protected readonly loginError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form.valueChanges.subscribe(() => this.loginError.set(null));
  }

  protected onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.loginError.set(null);

    this.authService
      .login(this.form.value as { email: string; password: string })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.authService.setSession(res.token, res.user);
          const route = ROLE_ROUTES[res.user.role];
          this.router.navigate([route || '/alumno']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.loginError.set('Correo o contraseña incorrectos.');
          } else {
            this.loginError.set('Error al conectar con el servidor. Intenta de nuevo.');
          }
        },
      });
  }
}
