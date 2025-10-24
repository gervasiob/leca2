'use client';
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
  const publicApiPrefixes = ['/api/login', '/api/register', '/api/logout', '/api/db'];
  const isApiRoute = pathname.startsWith('/api/');

  // Ignorar assets y archivos estáticos
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || /\.(svg|png|jpg|jpeg|gif|ico|css|js)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Rutas de API públicas siempre permitidas
  if (isApiRoute && publicApiPrefixes.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  if (isLoggedIn) {
    if (publicPages.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    
    // Si no es una ruta de API, verificar permisos de pantalla
    if (!isApiRoute) {
      const allowedScreens = await fetchUserPermissions(req);
      if (!isPathAllowed(pathname, allowedScreens)) {
        if (pathname === '/dashboard') {
            // Evita bucle si dashboard no está permitido, aunque debería estarlo para cualquier rol logueado.
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }
  } else {
    // Si no está logueado y la ruta no es pública, redirigir a login
    if (!publicPages.includes(pathname) && !isApiRoute) {
      const loginUrl = new URL('/login', nextUrl);
      loginUrl.searchParams.set('next', pathname + nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    // Si no está logueado y es una API no pública
    if (isApiRoute) {
        return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
