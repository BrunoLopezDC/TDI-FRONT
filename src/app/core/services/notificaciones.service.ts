import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { MessageResponse, Notificacion } from '../../models';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getAll() {
    return this.http.get<Notificacion[]>(`${environment.apiBaseUrl}/api/users/notificaciones`);
  }

  marcarLeida(id: string) {
    return this.http.put<MessageResponse>(
      `${environment.apiBaseUrl}/api/users/notificaciones/${id}/leer`,
      {},
    );
  }
}
