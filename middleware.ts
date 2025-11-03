import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  

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
