import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Update last login before creating the cookie payload
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // Exclude passwordHash from the payload
    const { passwordHash, ...payload } = updatedUser;
    
    // Ensure all fields are serializable
    const serializablePayload = {
      ...payload,
      lastLogin: updatedUser.lastLogin.toISOString(), // Now guaranteed to exist
    }

    const res = NextResponse.json({ ok: true, user: serializablePayload }, { status: 200 });
    res.cookies.set('auth_user', JSON.stringify(serializablePayload), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;

  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error("Login error:", message);
    return NextResponse.json({ ok: false, error: 'Error del servidor al intentar iniciar sesión.' }, { status: 500 });
  }
}
