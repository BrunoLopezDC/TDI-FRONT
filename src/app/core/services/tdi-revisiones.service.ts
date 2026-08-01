import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { DictamenRequest, MessageResponse, RevisionPendiente } from '../../models';

@Injectable({ providedIn: 'root' })
export class TdiRevisionesService {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getPendientes() {
    return this.http.get<RevisionPendiente[]>(`${environment.apiBaseUrl}/api/tdi/revisiones/pendientes`);
  }

  dictaminar(id: string, data: DictamenRequest) {
    return this.http.post<MessageResponse>(
      `${environment.apiBaseUrl}/api/tdi/revisiones/${id}/dictamen`,
      data,
    );
  }
}
