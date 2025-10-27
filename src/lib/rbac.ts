export const ROLE_NAME_MAP: Record<string, string> = {
  Admin: 'Admin',
  Sales: 'Ventas',
  Production: 'Produccion',
  Invitado: 'Invitado',
};

export const SCREENS_TO_PATHS: Record<string, string[]> = {
  'Tablero': ['/dashboard'],
  'Cuentas por Cobrar': ['/accounts-receivable'],
  'Ventas': ['/sales', '/sales/orders', '/sales/clients'],
  'Reclamos': ['/sales/claims'],
  'Produccion': ['/production', '/production/batches'],
  'Remitos': ['/dispatch'],
  'Listas de Precios': ['/price-lists'],
  'Configuración': ['/settings', '/settings/users', '/settings/roles', '/settings/products'],
  'Reportes': ['/report'],
};

export const normalizeName = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function isPathAllowed(pathname: string, allowedScreens: string[]): boolean {
  const normalizedPath = pathname.toLowerCase();

  // Reglas específicas de Ventas
  if (normalizedPath.startsWith('/sales')) {
    const hasSales = allowedScreens.includes('Ventas');
    const hasClaims = allowedScreens.includes('Reclamos');
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
