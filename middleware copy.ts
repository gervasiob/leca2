import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_user');
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!authCookie;

  // Define las rutas públicas que no requieren autenticación
  const publicPages = ['/', '/login', '/register'];

  // Define prefijos de rutas públicas (para APIs, assets, etc.)
  const publicPrefixes = ['/api/login', '/api/register', '/api/db', '/_next/', '/favicon.ico'];

  const isPublicPath =
    publicPages.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (process.env.MIDDLEWARE_ENABLED !== 'true') {
    return NextResponse.next();
  }

  // Si el usuario está autenticado
  if (isAuthenticated) {
    // Si intenta acceder a login o register, redirigir al dashboard
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } 
  // Si el usuario no está autenticado
  else {
    // Y está intentando acceder a una página protegida
    if (!isPublicPath) {
      // Redirigir a login, manteniendo la URL original como parámetro `next`
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si ninguna de las condiciones anteriores se cumple, permitir el acceso
  return NextResponse.next();
}

// El matcher define en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/dev (para endpoints de desarrollo)
     * - dev (para páginas de desarrollo)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/dev|dev/|_next/static|_next/image|favicon.ico).*)',
  ],
};
