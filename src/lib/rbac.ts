export const ROLE_NAME_MAP: Record<string, string> = {
  Admin: 'Admin',
  Sales: 'Ventas',
  Production: 'Producción',
  Invitado: 'Invitado',
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
};

export const normalizeName = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function isPathAllowed(pathname: string, allowedScreens: string[]): boolean {
  const normalizedPath = pathname.toLowerCase();

  // Siempre permitir dashboard como fallback para usuarios logueados
  if (normalizedPath.startsWith('/dashboard')) return true;

  // Ventas: '/sales/*' requiere 'Ventas'; '/sales/claims' requiere 'Reclamos'
  if (normalizedPath.startsWith('/sales')) {
    const hasSales = allowedScreens.includes('Ventas');
    const hasClaims = allowedScreens.includes('Reclamos');
    if (normalizedPath.startsWith('/sales/claims')) {
      return hasClaims;
    }
    return hasSales;
  }

  for (const screen of allowedScreens) {
    const prefixes = SCREENS_TO_PATHS[screen];
    if (!prefixes) continue;
    if (prefixes.some((prefix) => normalizedPath.startsWith(prefix.toLowerCase()))) {
      return true;
    }
  }
  return false;
}