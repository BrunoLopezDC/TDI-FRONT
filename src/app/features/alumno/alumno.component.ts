import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../shared/layouts/app-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { TdiRegistroService } from '../../core/services/tdi-registro.service';
import { TdiCatalogoService } from '../../core/services/tdi-catalogo.service';
import type { MisRegistrosItem, ProgresoResponse, TablaMaestraItem } from '../../models';

@Component({
  selector: 'app-alumno',
  imports: [RouterLink, AppShellComponent, Card, ProgressBar, Tag, Skeleton, Message, Button, PrimeTemplate],
  templateUrl: './alumno.component.html',
  styleUrl: './alumno.component.css',
})
export class AlumnoComponent implements OnInit {
  private readonly registroService: TdiRegistroService;
  private readonly catalogoService: TdiCatalogoService;
  protected readonly authService: AuthService;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly progreso = signal<ProgresoResponse | null>(null);
  protected readonly registros = signal<MisRegistrosItem[]>([]);
  protected readonly dimensionesCatalogo = signal<TablaMaestraItem[]>([]);

  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.nombre ?? '';
  });

  protected readonly totalRegistros = computed(() => this.registros().length);

  protected readonly enRevisionCount = computed(
    () => this.registros().filter((r) => r.estado === 'EN REVISION').length,
  );

  protected readonly dimensionesConPuntos = computed(
    () => this.progreso()?.dimensiones.filter((d) => d.puntos_acumulados > 0).length ?? 0,
  );

  protected readonly totalDimensiones = computed(() => this.dimensionesCatalogo().length);

  protected readonly dimensionesFaltantes = computed(() => {
    const conPuntos = new Set(this.progreso()?.dimensiones.map((d) => d.dimension) ?? []);
    return this.dimensionesCatalogo().filter((d) => !conPuntos.has(d.nombre));
  });

  protected readonly porcentajeGlobal = computed(() => {
    const p = this.progreso();
    if (!p || p.meta_puntos === 0) return 0;
    return Math.round((p.puntos_acumulados / p.meta_puntos) * 100);
  });

  protected readonly registrosRecientes = computed(() => this.registros().slice(0, 5));

  constructor(
    registroService: TdiRegistroService,
    catalogoService: TdiCatalogoService,
    authService: AuthService,
  ) {
    this.registroService = registroService;
    this.catalogoService = catalogoService;
    this.authService = authService;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  private cargarDatos() {
    this.loading.set(true);
    this.error.set(null);

    this.registroService.getProgreso().subscribe({
      next: (data) => {
        this.progreso.set(data);
      },
      error: () => {
        this.error.set('Error al cargar el progreso.');
        this.loading.set(false);
      },
    });

    this.registroService.getMisRegistros().subscribe({
      next: (data) => {
        this.registros.set(data);
      },
      error: () => {
        this.error.set('Error al cargar los registros.');
        this.loading.set(false);
      },
    });

    this.catalogoService.getDimensiones().subscribe({
      next: (data) => {
        this.dimensionesCatalogo.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los datos del catálogo.');
        this.loading.set(false);
      },
    });
  }

  protected tagSeverity(estado: string) {
    switch (estado) {
      case 'APROBADA':
        return 'success';
      case 'RECHAZADA':
        return 'danger';
      case 'EN REVISION':
        return 'warn';
      case 'PENDIENTE':
        return 'info';
      default:
        return 'info';
    }
  }
}
