import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../shared/layouts/app-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { TdiRevisionesService } from '../../core/services/tdi-revisiones.service';
import { TdiCatalogoService } from '../../core/services/tdi-catalogo.service';

@Component({
  selector: 'app-creador',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    AppShellComponent,
    Card,
    Tag,
    Skeleton,
    Message,
    Button,
    Dialog,
    InputText,
    Textarea,
    Toast,
    PrimeTemplate,
  ],
  providers: [MessageService],
  templateUrl: './creador.component.html',
  styleUrl: './creador.component.css',
})
export class CreadorComponent implements OnInit {
  private readonly revisionesService: TdiRevisionesService;
  private readonly catalogoService: TdiCatalogoService;
  protected readonly authService: AuthService;
  private readonly messageService: MessageService;

  protected readonly loadingPendientes = signal(true);
  protected readonly errorPendientes = signal<string | null>(null);
  protected readonly evidenciasPendientes = signal(0);

  protected readonly loadingCatalogo = signal(true);
  protected readonly errorCatalogo = signal<string | null>(null);
  protected readonly actividadesCatalogo = signal(0);

  protected readonly user = computed(() => this.authService.currentUser());
  protected readonly userName = computed(() => this.user()?.nombre ?? '');
  protected readonly perfilCreador = computed(() => this.user()?.perfil_creador ?? null);

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

  constructor(
    revisionesService: TdiRevisionesService,
    catalogoService: TdiCatalogoService,
    authService: AuthService,
    messageService: MessageService,
  ) {
    this.revisionesService = revisionesService;
    this.catalogoService = catalogoService;
    this.authService = authService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.cargarConteos();
  }

  private cargarConteos() {
    this.loadingPendientes.set(true);
    this.loadingCatalogo.set(true);

    this.revisionesService.getPendientes().subscribe({
      next: (data) => {
        this.evidenciasPendientes.set(data.length);
        this.loadingPendientes.set(false);
      },
      error: () => {
        this.errorPendientes.set('No se pudo cargar el conteo de evidencias pendientes.');
        this.loadingPendientes.set(false);
      },
    });

    this.catalogoService.getAll().subscribe({
      next: (data) => {
        this.actividadesCatalogo.set(data.length);
        this.loadingCatalogo.set(false);
      },
      error: () => {
        this.errorCatalogo.set('No se pudo cargar el catálogo.');
        this.loadingCatalogo.set(false);
      },
    });
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
        // Reload counts
        this.cargarConteos();
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
