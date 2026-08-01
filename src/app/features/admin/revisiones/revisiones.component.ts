import { Component, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { TdiRevisionesService } from '../../../core/services/tdi-revisiones.service';
import { environment } from '../../../environments/environment';
import type { DictamenDecision, RevisionPendiente } from '../../../models';

@Component({
  selector: 'app-revisiones',
  imports: [
    AppShellComponent,
    FormsModule,
    Button,
    Skeleton,
    Message,
    Toast,
    Dialog,
    Textarea,
    PrimeTemplate,
  ],
  providers: [MessageService],
  templateUrl: './revisiones.component.html',
  styleUrl: './revisiones.component.css',
})
export class RevisionesComponent implements OnInit {
  private readonly revisionesService: TdiRevisionesService;
  private readonly messageService: MessageService;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly revisiones = signal<RevisionPendiente[]>([]);

  protected readonly dialogVisible = signal(false);
  protected readonly revisionActiva = signal<RevisionPendiente | null>(null);
  protected readonly decision = signal<DictamenDecision | null>(null);
  protected readonly comentario = signal('');
  protected readonly enviando = signal(false);

  constructor(revisionesService: TdiRevisionesService, messageService: MessageService) {
    this.revisionesService = revisionesService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.cargarRevisiones();
  }

  protected cargarRevisiones() {
    this.loading.set(true);
    this.error.set(null);

    this.revisionesService.getPendientes().subscribe({
      next: (data) => {
        this.revisiones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message ||
            'No se pudieron cargar las revisiones pendientes. Intenta de nuevo más tarde.',
        );
        this.loading.set(false);
      },
    });
  }

  protected evidenciaUrl(url: string): string {
    return `${environment.apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  protected abrirDictamen(revision: RevisionPendiente, decision: DictamenDecision) {
    this.revisionActiva.set(revision);
    this.decision.set(decision);
    this.comentario.set('');
    this.dialogVisible.set(true);
  }

  protected confirmarDictamen() {
    const revision = this.revisionActiva();
    const decision = this.decision();
    const comentario = this.comentario().trim();
    if (!revision || !decision || !comentario) return;

    this.enviando.set(true);

    this.revisionesService.dictaminar(revision.revision_id, { decision, comentario }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: decision === 'APROBADA' ? 'Evidencia aprobada' : 'Evidencia rechazada',
          detail:
            decision === 'APROBADA'
              ? `La evidencia de ${revision.nombre} fue aprobada.`
              : `La evidencia de ${revision.nombre} fue rechazada.`,
          life: 4000,
        });
        this.revisiones.update((prev) => prev.filter((r) => r.revision_id !== revision.revision_id));
        this.cerrarDialogo();
      },
      error: (err) => {
        this.enviando.set(false);
        const detail =
          err.error?.message || err.message || 'Ocurrió un error al enviar el dictamen.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail,
          life: 5000,
        });
      },
    });
  }

  protected cerrarDialogo() {
    this.dialogVisible.set(false);
    this.revisionActiva.set(null);
    this.decision.set(null);
    this.comentario.set('');
  }
}
