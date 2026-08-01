import { Component, computed } from '@angular/core';
import { Card } from 'primeng/card';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [AppShellComponent, Card, Avatar, Tag, Skeleton, PrimeTemplate],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  protected readonly authService: AuthService;

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly nombreCompleto = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    const apellido = u.apellido_paterno ? ` ${u.apellido_paterno}` : '';
    return `${u.nombre}${apellido}`;
  });

  protected readonly iniciales = computed(() => {
    const nombre = this.authService.currentUser()?.nombre ?? '';
    const parts = nombre.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  protected readonly roleLabel = computed(() => {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    const labels: Record<string, string> = {
      ALUMNO: 'Alumno',
      ADMINISTRATIVO: 'Administrativo',
      COORDINADOR: 'Coordinador',
      CREADOR_TDI: 'Creador',
    };
    return labels[role] ?? role;
  });

  protected readonly roleSeverity = computed(() => {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMINISTRATIVO':
      case 'COORDINADOR':
        return 'warn' as const;
      case 'CREADOR_TDI':
        return 'success' as const;
      default:
        return 'info' as const;
    }
  });

  protected readonly perfilAlumno = computed(() => this.authService.currentUser()?.perfil_alumno ?? null);

  constructor(authService: AuthService) {
    this.authService = authService;
  }
}
