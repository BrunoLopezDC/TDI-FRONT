import { Component, type OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { EvidenciaUploadComponent } from '../../../shared/components/evidencia-upload/evidencia-upload.component';
import { TdiRegistroService } from '../../../core/services/tdi-registro.service';
import type { MisRegistrosItem } from '../../../models';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-mis-actividades',
  imports: [
    FormsModule,
    RouterLink,
    AppShellComponent,
    TableModule,
    Tag,
    Select,
    InputText,
    Tooltip,
    Skeleton,
    Message,
    Button,
    Toast,
    PrimeTemplate,
    EvidenciaUploadComponent,
  ],
  providers: [MessageService],
  templateUrl: './mis-actividades.component.html',
  styleUrl: './mis-actividades.component.css',
})
export class MisActividadesComponent implements OnInit {
  private readonly registroService: TdiRegistroService;
  private readonly messageService: MessageService;

  protected readonly filterOptions: FilterOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En revisión', value: 'EN REVISION' },
    { label: 'Aprobada', value: 'APROBADA' },
    { label: 'Rechazada', value: 'RECHAZADA' },
  ];

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly registros = signal<MisRegistrosItem[]>([]);
  protected readonly filtroEstado = signal('');
  protected readonly textoBusqueda = signal('');

  protected readonly registrosFiltrados = computed(() => {
    let list = this.registros();
    const estado = this.filtroEstado();
    const busqueda = this.textoBusqueda().toLowerCase().trim();
    if (estado) {
      list = list.filter((r) => r.estado === estado);
    }
    if (busqueda) {
      list = list.filter((r) => r.tdi_nombre.toLowerCase().includes(busqueda));
    }
    return list;
  });

  protected readonly totalSinFiltro = computed(() => this.registros().length);
  protected readonly totalFiltrados = computed(() => this.registrosFiltrados().length);

  protected readonly registroIdSubir = signal<string>('');
  protected readonly uploadDialogVisible = signal(false);

  constructor(registroService: TdiRegistroService, messageService: MessageService) {
    this.registroService = registroService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.cargarRegistros();
  }

  protected cargarRegistros() {
    this.loading.set(true);
    this.error.set(null);

    this.registroService.getMisRegistros().subscribe({
      next: (data) => {
        this.registros.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus actividades. Intenta de nuevo más tarde.');
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

  protected onEvidenciaSubida(registroId: string) {
        this.registros.update((prev) =>
          prev.map((r) => (r.registro_id === registroId ? { ...r, estado: 'EN REVISION' as const } : r)),
        );
    this.messageService.add({
      severity: 'success',
      summary: 'Evidencia subida',
      detail: 'La evidencia se ha subido correctamente.',
      life: 4000,
    });
  }
}
