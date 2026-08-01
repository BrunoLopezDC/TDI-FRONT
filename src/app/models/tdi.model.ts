export interface CatalogoItem {
  id: string;
  nombre: string;
  descripcion: string;
  evidencia_requerida: string;
  horas: number;
  puntaje: number;
  fecha_vencimiento: string;
  categoria_id: string;
  dimension_id: string;
  trascendencia_id: string;
  entorno_id: string;
}

export interface TablaMaestraItem {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface CatalogoQueryParams {
  categoria_id?: string;
  dimension_id?: string;
  search?: string;
}

export interface CatalogoRequest {
  nombre: string;
  descripcion: string;
  evidencia_requerida: string;
  horas: number;
  puntaje: number;
  fecha_vencimiento: string;
  // Los siguientes 4 IDs se obtienen de los endpoints GET /api/tdi/{categorias,dimensiones,trascendencias,entornos}
  categoria_id: string;
  dimension_id: string;
  trascendencia_id: string;
  entorno_id: string;
}

export interface ProgresoResponse {
  meta_puntos: number;
  puntos_acumulados: number;
  dimensiones: DimensionProgreso[];
}

export interface DimensionProgreso {
  dimension: string;
  puntos_acumulados: number;
  porcentaje: number;
}
