'use client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_NAME_MAP, normalizeName, isPathAllowed } from '@/lib/rbac';
import { UserRole } from '@/lib/types';

async function fetchUserPermissions(request: NextRequest): Promise<string[]> {
    try {
        const rolesUrl = new URL('/api/roles', request.nextUrl).toString();
        const res = await fetch(rolesUrl, {
          headers: { cookie: request.headers.get('cookie') ?? '' },
        });

        if (!res.ok) return [];

        const data = await res.json();
        if (!Array.isArray(data?.roles)) return [];

        const rawCookie = request.cookies.get('auth_user')?.value;
        const user = rawCookie ? JSON.parse(rawCookie) : null;
        
        if (!user?.role) return [];

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
  const isPublicPage = publicPages.includes(pathname);
  const isApiRoute = pathname.startsWith('/api');

  // Ignorar assets y archivos estáticos
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || /\.(svg|png|jpg|jpeg|gif|ico|css|js)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Si el usuario está logueado
  if (isLoggedIn) {
    // Si intenta acceder a login/register, redirigir a dashboard
    if (isPublicPage) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    
    // Si no es una ruta de API, verificar permisos
    if (!isApiRoute) {
      const allowedScreens = await fetchUserPermissions(req);
      if (!isPathAllowed(pathname, allowedScreens)) {
        if (pathname === '/dashboard') {
            return NextResponse.next(); // Evitar bucle si no tiene acceso a dashboard
        }
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }

  // Si el usuario NO está logueado
  } else {
    // Si la ruta no es pública ni es una API, redirigir a login
    if (!isPublicPage && !isApiRoute) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('next', pathname + nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
