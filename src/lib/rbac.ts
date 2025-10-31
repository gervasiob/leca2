import { UserRole } from "./types";

export const ROLE_NAME_MAP: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Sales]: 'Ventas',
  [UserRole.Production]: 'Producción',
  [UserRole.Guest]: 'Invitado',
  [UserRole.System]: 'System',
};

export const SCREENS_TO_PATHS: Record<string, string[]> = {
  'Tablero': ['/dashboard'],
  'Cuentas por Cobrar': ['/accounts-receivable'],
  'Ventas': ['/sales', '/sales/orders', '/sales/clients'],
  'Reclamos': ['/sales/claims'],
  'Producción': ['/production', '/production/batches'],
  'Remitos': ['/dispatch'],
  'Listas de Precios': ['/price-lists'],
  'Configuración': ['/settings', '/settings/users', '/settings/roles', '/settings/products'],
  'Reportes': ['/report'],
  'DB Viewer': ['/dev/db-viewer'],
};

export const normalizeName = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function isPathAllowed(pathname: string, allowedScreens: string[]): boolean {
  const normalizedPath = pathname.toLowerCase();

  // Special rules first
  if (normalizedPath === '/' || normalizedPath.startsWith('/login') || normalizedPath.startsWith('/register')) {
    return true;
  }
  
  // Reglas específicas de Ventas
  if (normalizedPath.startsWith('/sales')) {
    const hasSales = allowedScreens.some(s => normalizeName(s) === normalizeName('Ventas'));
    const hasClaims = allowedScreens.some(s => normalizeName(s) === normalizeName('Reclamos'));
    if (normalizedPath.startsWith('/sales/claims')) {
      return hasClaims;
    }
    return hasSales;
  }

  // Reglas generales: match por prefijo
  for (const screen of allowedScreens) {
    const prefixes = SCREENS_TO_PATHS[screen];
    if (!prefixes) continue;
    for (const p of prefixes) {
      const pref = p.toLowerCase();
      if (normalizedPath === pref || normalizedPath.startsWith(pref + '/')) {
        return true;
      }
    }
  }
  return false;
}
