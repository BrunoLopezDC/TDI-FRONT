export type UserRole = 'ALUMNO' | 'ADMINISTRATIVO' | 'CREADOR_TDI' | 'COORDINADOR';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  activo?: boolean;
  created_at?: string;
  role: UserRole;
  perfil_alumno?: PerfilAlumno;
  perfil_administrativo?: PerfilAdministrativo;
  perfil_creador?: PerfilCreador;
}

export interface PerfilAlumno {
  matricula: string;
  carrera: string;
  horas_acumuladas: number;
}

export interface PerfilAdministrativo {
  cargo: string;
}

export interface PerfilCreador {
  institucion: string;
  tipo: string;
  descripcion: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  role: UserRole;
}

export interface MessageResponse {
  message: string;
}

export interface CompletarPerfilAlumnoRequest {
  matricula: string;
  grupo: string;
  carrera: string;
  cuatrimestre: number;
  tutor: string;
}

export interface CompletarPerfilAdministrativoRequest {
  cargo: string;
}

export interface CompletarPerfilCreadorRequest {
  institucion: string;
  tipo: string;
  descripcion: string;
}
