import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_NAME_MAP, normalizeName, isPathAllowed } from '@/lib/rbac';
import { UserRole } from '@/lib/types';

async function fetchUserPermissions(request: NextRequest): Promise<string[]> {
    try {
        const rolesUrl = new URL('/api/roles', request.nextUrl).toString();
        // Las llamadas a API desde el middleware deben ser absolutas y manejar la autenticación
        const res = await fetch(rolesUrl, {
          headers: { cookie: request.headers.get('cookie') ?? '' },
        });

        if (!res.ok) return [];

        const data = await res.json();
        if (!Array.isArray(data?.roles)) return [];

        const rawCookie = request.cookies.get('auth_user')?.value;
        const user = rawCookie ? JSON.parse(rawCookie) : null;
        
        if (!user?.role) return [];

        // Mapear el rol del enum de la cookie (ej: "Sales") al nombre legible (ej: "Ventas")
        const roleName = ROLE_NAME_MAP[user.role as UserRole] ?? user.role;
        const normalizedRoleName = normalizeName(roleName);
        
        const roleData = data.roles.find((r: any) => normalizeName(r.name) === normalizedRoleName);
        
        return roleData?.permissions ?? [];
    } catch (error) {
        console.error('Error fetching permissions in middleware:', error);
        return [];
    }
}


export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = Boolean(cookies.get('auth_user')?.value);

  const publicPages = ['/login', '/register'];
  const publicApi = ['/api/login', '/api/register', '/api/logout', '/api/db'];

  if (isAsset(pathname)) {
    return NextResponse.next();
  }

  if (publicPages.includes(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }
  
  if (publicApi.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/') && !isLoggedIn) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
  }
  
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('next', pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // A partir de aquí, el usuario está logueado.
  // Se obtiene los permisos y se valida el acceso.
  const allowedScreens = await fetchUserPermissions(req);
  
  if (!isPathAllowed(pathname, allowedScreens)) {
    // Si la ruta no está permitida, redirigir a dashboard.
    // Evitar bucle de redirección si dashboard no está permitido (aunque debería estarlo).
    if (pathname === '/dashboard') {
        // Si intenta acceder a dashboard y no tiene permiso, 
        // podría redirigir a una página de "acceso denegado" o simplemente no hacer nada.
        // Por ahora, lo dejamos pasar para evitar un bucle.
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
}

function isAsset(pathname: string): boolean {
    return pathname.startsWith('/_next/') ||
           pathname.startsWith('/static/') ||
           /\.(svg|png|jpg|jpeg|gif|ico|css|js)$/.test(pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
