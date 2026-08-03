import { Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-creador',
  standalone: true,
  imports: [
    AppShellComponent,
    DatePipe,
    FormsModule,
    Card,
    Avatar,
    Tag,
    Skeleton,
    Button,
    Dialog,
    InputText,
    Textarea,
    Message,
    Toast,
    PrimeTemplate,
  ],
  providers: [MessageService],
  templateUrl: './perfil-creador.component.html',
  styleUrl: './perfil-creador.component.css',
})
export class PerfilCreadorComponent {
  protected readonly authService: AuthService;
  private readonly messageService: MessageService;

  protected readonly user = computed(() => this.authService.currentUser());

  protected readonly nombreCompleto = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    const paterno = u.apellido_paterno ? ` ${u.apellido_paterno}` : '';
    const materno = u.apellido_materno ? ` ${u.apellido_materno}` : '';
    return `${u.nombre}${paterno}${materno}`;
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

  protected readonly perfilCreador = computed(() => this.authService.currentUser()?.perfil_creador ?? null);

  protected readonly fechaAlta = computed(() => {
    const created = this.authService.currentUser()?.created_at;
    return created ? new Date(created) : null;
  });

  // Modal State
  protected readonly dialogVisible = signal(false);
  protected readonly enviando = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly institucion = signal('');
  protected readonly tipo = signal('');
  protected readonly descripcion = signal('');

  protected readonly formValido = computed(() => {
    return (
      this.institucion().trim() !== '' &&
      this.tipo().trim() !== '' &&
      this.descripcion().trim() !== ''
    );
  });

  constructor(authService: AuthService, messageService: MessageService) {
    this.authService = authService;
    this.messageService = messageService;
  }

  protected abrirModal() {
    const pc = this.perfilCreador();
    this.institucion.set(pc?.institucion ?? '');
    this.tipo.set(pc?.tipo ?? '');
    this.descripcion.set(pc?.descripcion ?? '');
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  protected guardarPerfil() {
    if (!this.formValido() || this.enviando()) return;

    this.enviando.set(true);
    this.formError.set(null);

    const payload = {
      institucion: this.institucion().trim(),
      tipo: this.tipo().trim(),
      descripcion: this.descripcion().trim(),
    };

    this.authService.completarPerfilCreador(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.dialogVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil completado',
          detail: 'Tus datos de creador se han guardado con éxito.',
        });
        // Refresh session user data
        this.authService.refreshCurrentUser();
      },
      error: (err) => {
        this.enviando.set(false);
        this.formError.set(
          err.error?.message || 'Error al guardar los datos de creador. Intenta de nuevo.'
        );
      },
    });
  }
}
