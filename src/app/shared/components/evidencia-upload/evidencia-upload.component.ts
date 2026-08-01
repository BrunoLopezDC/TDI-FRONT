import { Component, model, output, input, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Dialog } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { TdiRegistroService } from '../../../core/services/tdi-registro.service';

@Component({
  selector: 'app-evidencia-upload',
  imports: [Button, Message, Dialog, PrimeTemplate],
  templateUrl: './evidencia-upload.component.html',
  styleUrl: './evidencia-upload.component.css',
})
export class EvidenciaUploadComponent {
  private readonly registroService: TdiRegistroService;

  readonly registroId = input.required<string>();
  readonly visible = model(false);
  readonly uploaded = output<string>();
  readonly errorUpload = output<string>();

  protected readonly archivo = signal<File | null>(null);
  protected readonly subiendo = signal(false);
  protected readonly errorMsg = signal<string | null>(null);

  constructor(registroService: TdiRegistroService) {
    this.registroService = registroService;
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivo.set(input.files[0]);
      this.errorMsg.set(null);
    }
  }

  protected subir() {
    const file = this.archivo();
    if (!file) return;

    this.subiendo.set(true);
    this.errorMsg.set(null);

    this.registroService.subirEvidencia(this.registroId(), file).subscribe({
      next: () => {
        this.subiendo.set(false);
        this.uploaded.emit(this.registroId());
        this.visible.set(false);
        this.archivo.set(null);
      },
      error: (err) => {
        this.subiendo.set(false);
        const detail = err.error?.message || err.message || 'Error al subir la evidencia.';
        this.errorMsg.set(detail);
        this.errorUpload.emit(detail);
      },
    });
  }

  protected onHide() {
    this.archivo.set(null);
    this.errorMsg.set(null);
  }
}
