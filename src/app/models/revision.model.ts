export type DictamenDecision = 'APROBADA' | 'RECHAZADA';

export interface RevisionPendiente {
  revision_id: string;
  registro_tdi_id: string;
  nombre: string;
  matricula: string;
  tdi_nombre: string;
  evidencia_url: string;
  ocr_observaciones: string;
}

export interface DictamenRequest {
  decision: DictamenDecision;
  comentario: string;
}
