import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'alumno',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alumno/alumno.component').then((m) => m.AlumnoComponent),
  },
  {
    path: 'alumno/actividades',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alumno/actividades/mis-actividades.component').then((m) => m.MisActividadesComponent),
  },
  {
    path: 'alumno/catalogo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alumno/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  {
    path: 'alumno/perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alumno/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'alumno/notificaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alumno/notificaciones/notificaciones.component').then(
        (m) => m.NotificacionesComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'admin/revisiones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/revisiones/revisiones.component').then((m) => m.RevisionesComponent),
  },
  {
    path: 'admin/catalogo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/catalogo/admin-catalogo.component').then(
        (m) => m.AdminCatalogoComponent,
      ),
  },
  {
    path: 'admin/perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/perfil/perfil-admin.component').then((m) => m.AdminPerfilComponent),
  },
  {
    path: 'creador',
    canActivate: [authGuard],
    loadComponent: () => import('./features/creador/creador.component').then((m) => m.CreadorComponent),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
