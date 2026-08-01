import { Component, type OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { TdiCatalogoService } from '../../../core/services/tdi-catalogo.service';
import type { CatalogoItem, CatalogoRequest, TablaMaestraItem } from '../../../models';

@Component({
  selector: 'app-admin-catalogo',
  imports: [
    FormsModule,
    AppShellComponent,
    TableModule,
    Button,
    InputText,
    InputNumber,
    Textarea,
    DatePicker,
    Select,
    ConfirmDialog,
    Toast,
    Dialog,
    Skeleton,
    Message,
    Tooltip,
    PrimeTemplate,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-catalogo.component.html',
  styleUrl: './admin-catalogo.component.css',
})
export class AdminCatalogoComponent implements OnInit {
  private readonly catalogoService: TdiCatalogoService;
  private readonly confirmationService: ConfirmationService;
  private readonly messageService: MessageService;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actividades = signal<CatalogoItem[]>([]);
  protected readonly categorias = signal<TablaMaestraItem[]>([]);
  protected readonly dimensiones = signal<TablaMaestraItem[]>([]);
  protected readonly trascendencias = signal<TablaMaestraItem[]>([]);
  protected readonly entornos = signal<TablaMaestraItem[]>([]);

  protected readonly dialogVisible = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly nombre = signal('');
  protected readonly descripcion = signal('');
  protected readonly evidenciaRequerida = signal('');
  protected readonly horas = signal<number | null>(null);
  protected readonly puntaje = signal<number | null>(null);
  protected readonly fechaVencimiento = signal<string | null>(null);
  protected readonly categoriaId = signal('');
  protected readonly dimensionId = signal('');
  protected readonly trascendenciaId = signal('');
  protected readonly entornoId = signal('');

  protected readonly minFecha = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  });

  protected readonly formValido = computed(() => {
    const fechaOk = this.fechaVencimientoValida(this.fechaVencimiento());
    return (
      this.nombre().trim() !== '' &&
      this.descripcion().trim() !== '' &&
      this.evidenciaRequerida().trim() !== '' &&
      (this.horas() ?? 0) > 0 &&
      (this.puntaje() ?? 0) > 0 &&
      fechaOk &&
      this.categoriaId() !== '' &&
      this.dimensionId() !== '' &&
      this.trascendenciaId() !== '' &&
      this.entornoId() !== ''
    );
  });

  constructor(
    catalogoService: TdiCatalogoService,
    confirmationService: ConfirmationService,
    messageService: MessageService,
  ) {
    this.catalogoService = catalogoService;
    this.confirmationService = confirmationService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  protected cargarDatos() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      actividades: this.catalogoService.getAll(),
      categorias: this.catalogoService.getCategorias(),
      dimensiones: this.catalogoService.getDimensiones(),
      trascendencias: this.catalogoService.getTrascendencias(),
      entornos: this.catalogoService.getEntornos(),
    }).subscribe({
      next: (data) => {
        this.actividades.set(data.actividades);
        this.categorias.set(data.categorias);
        this.dimensiones.set(data.dimensiones);
        this.trascendencias.set(data.trascendencias);
        this.entornos.set(data.entornos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
        this.loading.set(false);
      },
    });
  }

  private refrescarCatalogo() {
    this.catalogoService.getAll().subscribe({
      next: (data) => this.actividades.set(data),
      error: () => {},
    });
  }

  protected formatearFecha(fecha: string): string {
    return fecha.slice(0, 10);
  }

  protected categoriaNombre(categoriaId: string): string {
    return this.categorias().find((c) => c.id === categoriaId)?.nombre ?? categoriaId;
  }

  protected abrirFormulario(actividad?: CatalogoItem) {
    this.formError.set(null);

    if (actividad) {
      this.editandoId.set(actividad.id);
      this.nombre.set(actividad.nombre);
      this.descripcion.set(actividad.descripcion);
      this.evidenciaRequerida.set(actividad.evidencia_requerida);
      this.horas.set(actividad.horas);
      this.puntaje.set(actividad.puntaje);
      this.fechaVencimiento.set(this.formatearFecha(actividad.fecha_vencimiento));
      this.categoriaId.set(actividad.categoria_id);
      this.dimensionId.set(actividad.dimension_id);
      this.trascendenciaId.set(actividad.trascendencia_id);
      this.entornoId.set(actividad.entorno_id);
    } else {
      this.editandoId.set(null);
      this.nombre.set('');
      this.descripcion.set('');
      this.evidenciaRequerida.set('');
      this.horas.set(null);
      this.puntaje.set(null);
      this.fechaVencimiento.set(null);
      this.categoriaId.set('');
      this.dimensionId.set('');
      this.trascendenciaId.set('');
      this.entornoId.set('');
    }

    this.dialogVisible.set(true);
  }

  protected guardar() {
    if (!this.formValido()) return;

    const request: CatalogoRequest = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      evidencia_requerida: this.evidenciaRequerida().trim(),
      horas: this.horas() ?? 0,
      puntaje: this.puntaje() ?? 0,
      fecha_vencimiento: this.fechaVencimiento() ?? '',
      categoria_id: this.categoriaId(),
      dimension_id: this.dimensionId(),
      trascendencia_id: this.trascendenciaId(),
      entorno_id: this.entornoId(),
    };

    this.enviando.set(true);
    this.formError.set(null);

    const editandoId = this.editandoId();

    const request$ = editandoId
      ? this.catalogoService.update(editandoId, request)
      : this.catalogoService.create(request);

    request$.subscribe({
      next: () => {
        this.enviando.set(false);
        if (editandoId) {
          const actividadActualizada: CatalogoItem = { ...request, id: editandoId };
          this.actividades.update((prev) =>
            prev.map((a) => (a.id === editandoId ? actividadActualizada : a)),
          );
          this.messageService.add({
            severity: 'success',
            summary: 'Actividad actualizada',
            detail: `"${request.nombre}" se actualizó correctamente.`,
            life: 4000,
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Actividad creada',
            detail: `"${request.nombre}" se agregó al catálogo.`,
            life: 4000,
          });
          this.refrescarCatalogo();
        }
        this.cerrarFormulario();
      },
      error: (err) => {
        this.enviando.set(false);
        const detail =
          err.error?.message || err.message || 'Ocurrió un error al guardar la actividad.';
        this.formError.set(detail);
      },
    });
  }

  protected confirmarEliminar(actividad: CatalogoItem) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar "${actividad.nombre}" del catálogo? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.eliminar(actividad),
    });
  }

  private eliminar(actividad: CatalogoItem) {
    this.catalogoService.delete(actividad.id).subscribe({
      next: () => {
        this.actividades.update((prev) => prev.filter((a) => a.id !== actividad.id));
        this.messageService.add({
          severity: 'success',
          summary: 'Actividad eliminada',
          detail: `"${actividad.nombre}" se eliminó del catálogo.`,
          life: 4000,
        });
      },
      error: (err) => {
        const detail =
          err.error?.message || err.message || 'Ocurrió un error al eliminar la actividad.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 5000,
        });
      },
    });
  }

  protected cerrarFormulario() {
    if (this.enviando()) return;
    this.dialogVisible.set(false);
    this.editandoId.set(null);
    this.formError.set(null);
  }

  private fechaVencimientoValida(fecha: string | null): boolean {
    if (!fecha) return false;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
    if (!match) return false;

    const anio = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);
    const date = new Date(anio, mes - 1, dia);
    if (date.getFullYear() !== anio || date.getMonth() !== mes - 1 || date.getDate() !== dia) {
      return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return date >= hoy;
  }
}
