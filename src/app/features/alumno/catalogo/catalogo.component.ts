import { Component, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { EvidenciaUploadComponent } from '../../../shared/components/evidencia-upload/evidencia-upload.component';
import { TdiCatalogoService } from '../../../core/services/tdi-catalogo.service';
import { TdiRegistroService } from '../../../core/services/tdi-registro.service';
import type { CatalogoItem, TablaMaestraItem } from '../../../models';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-catalogo',
  imports: [
    FormsModule,
    AppShellComponent,
    Card,
    Select,
    InputText,
    Button,
    ConfirmDialog,
    Toast,
    Skeleton,
    Message,
    PrimeTemplate,
    EvidenciaUploadComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit {
  private readonly catalogoService: TdiCatalogoService;
  private readonly registroService: TdiRegistroService;
  private readonly confirmationService: ConfirmationService;
  private readonly messageService: MessageService;

  private readonly searchSubject = new Subject<string>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actividades = signal<CatalogoItem[]>([]);
  protected readonly categorias = signal<TablaMaestraItem[]>([]);
  protected readonly dimensiones = signal<TablaMaestraItem[]>([]);

  protected readonly filtroCategoria = signal('');
  protected readonly filtroDimension = signal('');
  protected readonly textoBusqueda = signal('');

  protected readonly idsSeleccionados = signal<Set<string>>(new Set());
  protected readonly seleccionandoId = signal<string | null>(null);
  protected readonly registroIdSubir = signal<string>('');
  protected readonly uploadDialogVisible = signal(false);

  protected readonly categoriaOptions = signal<FilterOption[]>([]);
  protected readonly dimensionOptions = signal<FilterOption[]>([]);

  constructor(
    catalogoService: TdiCatalogoService,
    registroService: TdiRegistroService,
    confirmationService: ConfirmationService,
    messageService: MessageService,
  ) {
    this.catalogoService = catalogoService;
    this.registroService = registroService;
    this.confirmationService = confirmationService;
    this.messageService = messageService;

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.cargarCatalogo();
    });
  }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    this.error.set(null);

    this.catalogoService.getCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.categoriaOptions.set([
          { label: 'Todas las categorías', value: '' },
          ...data.map((c) => ({ label: c.nombre, value: c.id })),
        ]);
      },
    });

    this.catalogoService.getDimensiones().subscribe({
      next: (data) => {
        this.dimensiones.set(data);
        this.dimensionOptions.set([
          { label: 'Todas las dimensiones', value: '' },
          ...data.map((d) => ({ label: d.nombre, value: d.id })),
        ]);
      },
    });

    this.cargarCatalogo();
  }

  protected cargarCatalogo() {
    this.loading.set(true);
    this.error.set(null);

    const params: { categoria_id?: string; dimension_id?: string; search?: string } = {};
    if (this.filtroCategoria()) params.categoria_id = this.filtroCategoria();
    if (this.filtroDimension()) params.dimension_id = this.filtroDimension();
    if (this.textoBusqueda().trim()) params.search = this.textoBusqueda().trim();

    this.catalogoService.getAll(params).subscribe({
      next: (data) => {
        this.actividades.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
        this.loading.set(false);
      },
    });
  }

  protected onCategoriaChange(value: string) {
    this.filtroCategoria.set(value);
    this.cargarCatalogo();
  }

  protected onDimensionChange(value: string) {
    this.filtroDimension.set(value);
    this.cargarCatalogo();
  }

  protected onSearchInput(value: string) {
    this.textoBusqueda.set(value);
    this.searchSubject.next(value);
  }

  protected confirmarSeleccion(actividad: CatalogoItem) {
    this.confirmationService.confirm({
      message: `¿Deseas seleccionar "${actividad.nombre}"? Esto creará un registro pendiente que deberás completar subiendo evidencia.`,
      header: 'Confirmar selección',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Sí, seleccionar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.seleccionarActividad(actividad),
    });
  }

  private seleccionarActividad(actividad: CatalogoItem) {
    this.seleccionandoId.set(actividad.id);

    this.registroService.seleccionarActividad({ catalogo_tdi_id: actividad.id }).subscribe({
      next: (response) => {
        this.idsSeleccionados.update((prev) => {
          const next = new Set(prev);
          next.add(actividad.id);
          return next;
        });
        this.seleccionandoId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Actividad seleccionada',
          detail: `"${actividad.nombre}" ha sido registrada con éxito.`,
          life: 4000,
        });
        this.registroIdSubir.set(response.registro_tdi_id);
        this.uploadDialogVisible.set(true);
      },
      error: (err) => {
        this.seleccionandoId.set(null);
        const detail =
          err.error?.message || err.message || 'Ocurrió un error al seleccionar la actividad.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 5000,
        });
      },
    });
  }

  protected onEvidenciaSubida() {
    this.messageService.add({
      severity: 'success',
      summary: 'Evidencia subida',
      detail: 'La evidencia se ha subido correctamente.',
      life: 4000,
    });
  }
}
