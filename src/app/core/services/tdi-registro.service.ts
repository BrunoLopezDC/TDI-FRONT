import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type {
  MisRegistrosItem,
  ProgresoResponse,
  SeleccionarActividadRequest,
  SeleccionarActividadResponse,
  SubirEvidenciaResponse,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class TdiRegistroService {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getProgreso() {
    return this.http.get<ProgresoResponse>(`${environment.apiBaseUrl}/api/tdi/alumnos/progreso`);
  }

  getMisRegistros() {
    return this.http.get<MisRegistrosItem[]>(`${environment.apiBaseUrl}/api/tdi/registro/mis-registros`);
  }

  seleccionarActividad(data: SeleccionarActividadRequest) {
    return this.http.post<SeleccionarActividadResponse>(
      `${environment.apiBaseUrl}/api/tdi/registro/seleccionar`,
      data,
    );
  }

  subirEvidencia(id: string, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<SubirEvidenciaResponse>(
      `${environment.apiBaseUrl}/api/tdi/registro/${id}/subir-evidencia`,
      formData,
    );
  }
}
