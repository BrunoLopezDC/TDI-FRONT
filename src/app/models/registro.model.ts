export type RegistroEstado = 'PENDIENTE' | 'EN REVISION' | 'APROBADA' | 'RECHAZADA';

export interface SeleccionarActividadRequest {
  catalogo_tdi_id: string;
}

export interface SeleccionarActividadResponse {
  message: string;
  registro_tdi_id: string;
}

export interface MisRegistrosItem {
  registro_id: string;
  tdi_nombre: string;
  estado: RegistroEstado;
  horas_otorgadas: number;
  motivo_rechazo: string;
}

export interface SubirEvidenciaResponse {
  message: string;
  nombre_archivo: string;
  mime_type: string;
  hash: string;
  url_archivo: string;
}
