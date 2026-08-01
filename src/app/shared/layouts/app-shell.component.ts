import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Tooltip } from 'primeng/tooltip';
import { Drawer } from 'primeng/drawer';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionesStore } from '../../core/services/notificaciones.store';

interface NavItem {
  label: string;
  icon: string;
  route: string | null;
  tooltip: string;
  badge?: boolean;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ALUMNO: [
    { label: 'Inicio', icon: 'pi pi-home', route: '/alumno', tooltip: 'Inicio' },
    { label: 'Mis actividades', icon: 'pi pi-list', route: '/alumno/actividades', tooltip: 'Mis actividades' },
    { label: 'Catálogo', icon: 'pi pi-book', route: '/alumno/catalogo', tooltip: 'Catálogo' },
    { label: 'Mi perfil', icon: 'pi pi-user', route: '/alumno/perfil', tooltip: 'Mi perfil' },
    { label: 'Notificaciones', icon: 'pi pi-bell', route: '/alumno/notificaciones', tooltip: 'Notificaciones', badge: true },
  ],
  ADMINISTRATIVO: [
    { label: 'Inicio', icon: 'pi pi-home', route: '/admin', tooltip: 'Inicio' },
    { label: 'Revisiones pendientes', icon: 'pi pi-inbox', route: '/admin/revisiones', tooltip: 'Revisiones pendientes' },
    { label: 'Catálogo', icon: 'pi pi-book', route: '/admin/catalogo', tooltip: 'Catálogo' },
    { label: 'Mi perfil', icon: 'pi pi-user', route: '/admin/perfil', tooltip: 'Mi perfil' },
  ],
  COORDINADOR: [
    { label: 'Inicio', icon: 'pi pi-home', route: '/admin', tooltip: 'Inicio' },
    { label: 'Revisiones pendientes', icon: 'pi pi-inbox', route: '/admin/revisiones', tooltip: 'Revisiones pendientes' },
    { label: 'Catálogo', icon: 'pi pi-book', route: '/admin/catalogo', tooltip: 'Catálogo' },
    { label: 'Mi perfil', icon: 'pi pi-user', route: '/admin/perfil', tooltip: 'Mi perfil' },
  ],
  CREADOR_TDI: [
    { label: 'Inicio', icon: 'pi pi-home', route: '/creador', tooltip: 'Inicio' },
  ],
};

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, Button, Avatar, Tooltip, Drawer],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private readonly authService: AuthService;
  private readonly router: Router;
  private readonly notificacionesStore: NotificacionesStore;

  protected readonly collapsed = signal(false);
  protected readonly mobileOpen = signal(false);

  protected readonly currentUser = computed(() => this.authService.currentUser());

  protected readonly navItems = computed<NavItem[]>(() => {
    const role = this.currentUser()?.role;
    return NAV_BY_ROLE[role ?? ''] ?? [];
  });

  protected readonly userInitials = computed(() => {
    const name = this.currentUser()?.nombre ?? '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  protected readonly userName = computed(() => this.currentUser()?.nombre ?? '');
  protected readonly userRole = computed(() => {
    const role = this.currentUser()?.role;
    if (!role) return '';
    const labels: Record<string, string> = {
      ALUMNO: 'Alumno',
      ADMINISTRATIVO: 'Administrativo',
      COORDINADOR: 'Coordinador',
      CREADOR_TDI: 'Creador',
    };
    return labels[role] ?? role;
  });

  protected readonly notifUnreadCount = computed(() => this.notificacionesStore.unreadCount());

  constructor(
    authService: AuthService,
    router: Router,
    notificacionesStore: NotificacionesStore,
  ) {
    this.authService = authService;
    this.router = router;
    this.notificacionesStore = notificacionesStore;
    this.notificacionesStore.loadIfNeeded();
  }

  protected toggleCollapsed() {
    this.collapsed.update((v) => !v);
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
