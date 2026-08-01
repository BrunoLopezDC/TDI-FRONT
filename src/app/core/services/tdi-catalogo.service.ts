import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { CatalogoItem, CatalogoQueryParams, CatalogoRequest, TablaMaestraItem } from '../../models';

@Injectable({ providedIn: 'root' })
export class TdiCatalogoService {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getAll(params?: CatalogoQueryParams) {
    let httpParams = new HttpParams();
    if (params?.categoria_id) httpParams = httpParams.set('categoria_id', params.categoria_id);
    if (params?.dimension_id) httpParams = httpParams.set('dimension_id', params.dimension_id);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<CatalogoItem[]>(`${environment.apiBaseUrl}/api/tdi/catalogo`, {
      params: httpParams,
    });
  }

  getById(id: string) {
    // TODO: confirmar respuesta exacta contra backend (no documentado en ExplicacionEndpoints.md)
    return this.http.get<CatalogoItem>(`${environment.apiBaseUrl}/api/tdi/catalogo/${id}`);
  }

  create(data: CatalogoRequest) {
    return this.http.post<CatalogoItem>(`${environment.apiBaseUrl}/api/tdi/catalogo`, data);
  }

  update(id: string, data: CatalogoRequest) {
    return this.http.put<CatalogoItem>(`${environment.apiBaseUrl}/api/tdi/catalogo/${id}`, data);
  }

  // TODO: confirmar respuesta exacta contra backend (no documentado en ExplicacionEndpoints.md)
  delete(id: string) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/api/tdi/catalogo/${id}`);
  }

  getCategorias() {
    return this.http.get<TablaMaestraItem[]>(`${environment.apiBaseUrl}/api/tdi/categorias`);
  }

  getDimensiones() {
    return this.http.get<TablaMaestraItem[]>(`${environment.apiBaseUrl}/api/tdi/dimensiones`);
  }

  getEntornos() {
    return this.http.get<TablaMaestraItem[]>(`${environment.apiBaseUrl}/api/tdi/entornos`);
  }

  getTrascendencias() {
    return this.http.get<TablaMaestraItem[]>(`${environment.apiBaseUrl}/api/tdi/trascendencias`);
  }
}
