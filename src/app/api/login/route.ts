import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { users } from '@/lib/data';

const passwordForRole = (role: 'Admin' | 'Sales' | 'Production' | 'Invitado') =>
  role === 'Admin' ? 'admin' :
  role === 'Sales' ? 'ventas' :
  role === 'Production' ? 'produccion' : 'invitado';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw: string | undefined = body?.email?.toString();
    const passwordRaw: string | undefined = body?.password?.toString();
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const password = passwordRaw ? passwordRaw.trim() : undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Intento con base de datos
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return NextResponse.json(
          { ok: false, error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }

      await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
      const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
      const res = NextResponse.json({ ok: true, user: payload }, { status: 200 });
      res.cookies.set('auth_user', JSON.stringify(payload), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }

    // Fallback: datos en memoria si no hay DB o el usuario no tiene hash
    const demoUser = users.find((u) => u.email.toLowerCase() === email);
    const expected = demoUser ? passwordForRole(demoUser.role) : undefined;
    if (!demoUser || password !== expected) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const payload = { id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role };
    const res = NextResponse.json({ ok: true, user: payload }, { status: 200 });
    res.cookies.set('auth_user', JSON.stringify(payload), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (e: any) {
    // Si Prisma falla (DB no disponible), intentar fallback con datos de demo
    try {
      const body = await request.json();
      const emailRaw: string | undefined = body?.email?.toString();
      const passwordRaw: string | undefined = body?.password?.toString();
      const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
      const password = passwordRaw ? passwordRaw.trim() : undefined;
      const demoUser = email ? users.find((u) => u.email.toLowerCase() === email) : undefined;
      const expected = demoUser ? passwordForRole(demoUser.role) : undefined;
      if (!demoUser || !password || password !== expected) {
        const message = e instanceof Error ? e.message : 'Error desconocido';
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
      }
      const payload = { id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role };
      const res = NextResponse.json({ ok: true, user: payload }, { status: 200 });
      res.cookies.set('auth_user', JSON.stringify(payload), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    } catch {
      const message = e instanceof Error ? e.message : 'Error desconocido';
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  }
}