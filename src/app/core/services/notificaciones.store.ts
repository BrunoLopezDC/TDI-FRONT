import { Injectable, signal } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';
import type { Notificacion } from '../../models';

@Injectable({ providedIn: 'root' })
export class NotificacionesStore {
  private readonly notificacionesService: NotificacionesService;

  readonly unreadCount = signal(0);
  private loaded = false;

  constructor(notificacionesService: NotificacionesService) {
    this.notificacionesService = notificacionesService;
  }

  loadIfNeeded() {
    if (this.loaded) return;
    this.loaded = true;
    this.notificacionesService.getAll().subscribe({
      next: (items) => {
        this.unreadCount.set(items.filter((n) => !n.leida).length);
      },
      error: () => {
        this.loaded = false;
      },
    });
  }

  setFromList(items: Notificacion[]) {
    this.loaded = true;
    this.unreadCount.set(items.filter((n) => !n.leida).length);
  }

  markOneRead() {
    this.unreadCount.update((c) => Math.max(0, c - 1));
  }

  markAllRead() {
    this.unreadCount.set(0);
  }
}
