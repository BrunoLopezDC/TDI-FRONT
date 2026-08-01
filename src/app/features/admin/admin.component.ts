import { Component, type OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../shared/layouts/app-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { TdiRevisionesService } from '../../core/services/tdi-revisiones.service';
import { TdiCatalogoService } from '../../core/services/tdi-catalogo.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, AppShellComponent, Card, Tag, Skeleton, Message, PrimeTemplate],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private readonly revisionesService: TdiRevisionesService;
  private readonly catalogoService: TdiCatalogoService;
  protected readonly authService: AuthService;

  protected readonly loadingPendientes = signal(true);
  protected readonly errorPendientes = signal<string | null>(null);
  protected readonly evidenciasPendientes = signal(0);

  protected readonly loadingCatalogo = signal(true);
  protected readonly errorCatalogo = signal<string | null>(null);
  protected readonly actividadesCatalogo = signal(0);

  protected readonly userName = computed(() => this.authService.currentUser()?.nombre ?? '');

  protected readonly roleLabel = computed(() => {
    const role = this.authService.currentUser()?.role;
    if (!role) return '';
    const labels: Record<string, string> = {
      ADMINISTRATIVO: 'Administrativo',
      COORDINADOR: 'Coordinador',
    };
    return labels[role] ?? role;
  });

  protected readonly roleSeverity = computed(() => {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMINISTRATIVO':
      case 'COORDINADOR':
        return 'warn' as const;
      default:
        return 'info' as const;
    }
  });

  constructor(
    revisionesService: TdiRevisionesService,
    catalogoService: TdiCatalogoService,
    authService: AuthService,
  ) {
    this.revisionesService = revisionesService;
    this.catalogoService = catalogoService;
    this.authService = authService;
  }

  ngOnInit() {
    this.cargarConteos();
  }

  private cargarConteos() {
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
}
