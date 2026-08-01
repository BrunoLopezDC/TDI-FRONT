import { Component, type OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { PrimeTemplate } from 'primeng/api';
import { AppShellComponent } from '../../../shared/layouts/app-shell.component';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { NotificacionesStore } from '../../../core/services/notificaciones.store';
import type { Notificacion } from '../../../models';

@Component({
  selector: 'app-notificaciones',
  imports: [AppShellComponent, Card, Button, Skeleton, Message, PrimeTemplate],
  providers: [DatePipe],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css',
})
export class NotificacionesComponent implements OnInit {
  private readonly notificacionesService: NotificacionesService;
  private readonly notificacionesStore: NotificacionesStore;
  private readonly datePipe: DatePipe;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notificaciones = signal<Notificacion[]>([]);
  protected readonly marcandoTodas = signal(false);

  protected readonly sinLeerCount = computed(
    () => this.notificaciones().filter((n) => !n.leida).length,
  );

  protected readonly haySinLeer = computed(() => this.sinLeerCount() > 0);

  constructor(
    notificacionesService: NotificacionesService,
    notificacionesStore: NotificacionesStore,
    datePipe: DatePipe,
  ) {
    this.notificacionesService = notificacionesService;
    this.notificacionesStore = notificacionesStore;
    this.datePipe = datePipe;
  }

  ngOnInit() {
    this.cargarNotificaciones();
  }

  protected cargarNotificaciones() {
    this.loading.set(true);
    this.error.set(null);

    this.notificacionesService.getAll().subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.notificacionesStore.setFromList(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las notificaciones. Intenta de nuevo más tarde.');
        this.loading.set(false);
      },
    });
  }

  protected marcarLeida(notif: Notificacion) {
    if (notif.leida) return;

    this.notificacionesService.marcarLeida(notif.id).subscribe({
      next: () => {
        this.notificaciones.update((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n)),
        );
        this.notificacionesStore.markOneRead();
      },
      error: () => {
        // feedback opcional si falla el marcado individual
      },
    });
  }

  protected marcarTodasLeidas() {
    const sinLeer = this.notificaciones().filter((n) => !n.leida);
    if (sinLeer.length === 0) return;

    this.marcandoTodas.set(true);
    forkJoin(sinLeer.map((n) => this.notificacionesService.marcarLeida(n.id))).subscribe({
      next: () => {
        this.notificaciones.update((prev) => prev.map((n) => ({ ...n, leida: true })));
        this.notificacionesStore.markAllRead();
        this.marcandoTodas.set(false);
      },
      error: () => {
        this.marcandoTodas.set(false);
      },
    });
  }

  protected formatearFecha(iso: string): string {
    const fecha = new Date(iso);
    const ahora = new Date();
    const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);

    if (minutos < 1) return 'justo ahora';
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    return this.datePipe.transform(fecha, 'dd MMM yyyy') ?? '';
  }
}
