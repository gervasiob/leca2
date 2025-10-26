import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_NAME_MAP, normalizeName, isPathAllowed, SCREENS_TO_PATHS } from '@/lib/rbac';
import { UserRole } from '@/lib/types';

async function fetchUserPermissions(request: NextRequest): Promise<string[]> {
    try {
        const rolesUrl = `${request.nextUrl.origin}/api/roles`;
        // Las llamadas a API desde el middleware deben ser absolutas y manejar la autenticación
        const res = await fetch(rolesUrl, {
          headers: { cookie: request.headers.get('cookie') ?? '' },
        });

        if (!res.ok) return [];

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return [];
        }

        let data: any;
        try {
          data = await res.json();
        } catch {
          return [];
        }

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

function resolveDefaultPath(allowedScreens: string[]): string {
  for (const screen of allowedScreens) {
    const paths = SCREENS_TO_PATHS[screen];
    if (paths && paths.length > 0) {
      return paths[0];
    }
  }
  return '/login';
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
      const allowedScreens = await fetchUserPermissions(req);
      const defaultPath = resolveDefaultPath(allowedScreens);
      return NextResponse.redirect(new URL(defaultPath, nextUrl));
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
    const defaultPath = resolveDefaultPath(allowedScreens);
    return NextResponse.redirect(new URL(defaultPath, nextUrl));
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
