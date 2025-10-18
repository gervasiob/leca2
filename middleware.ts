import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = Boolean(cookies.get('auth_user')?.value);

  // Rutas públicas permitidas sin login
  const publicPages = ['/login', '/register'];
  const publicApi = ['/api/login', '/api/register', '/api/logout'];

  // Ignorar assets estáticos
  const isAsset =
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg');
  if (isAsset) return NextResponse.next();

  // Permitir páginas públicas
  if (publicPages.includes(pathname)) {
    // Si ya está logueado, redirigir a dashboard
    if (isLoggedIn) {
      const url = new URL('/dashboard', nextUrl);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Permitir APIs públicas
  if (publicApi.includes(pathname)) {
    return NextResponse.next();
  }

  // Si es una API privada y no está logueado, devolver 401
  if (pathname.startsWith('/api/')) {
    if (!isLoggedIn) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Para cualquier otra ruta, exigir login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    // Preservar la ruta de destino para post-login
    loginUrl.searchParams.set('next', pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};