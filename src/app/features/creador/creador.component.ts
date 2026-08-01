import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-creador',
  imports: [Button],
  template: `
    <div class="placeholder">
      <h2>Bienvenido, próximamente</h2>
      <p-button label="Cerrar sesión" (onClick)="logout()" />
    </div>
  `,
  styles: [
    `
      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 1rem;
        font-family: sans-serif;
        color: var(--login-text, #1e293b);
      }
    `,
  ],
})
export class CreadorComponent {
  constructor(private readonly authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
