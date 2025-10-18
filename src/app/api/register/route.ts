import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name: string | undefined = body?.name?.toString().trim();
    const emailRaw: string | undefined = body?.email?.toString();
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const passwordRaw: string | undefined = body?.password?.toString();
    const password = passwordRaw ? passwordRaw.trim() : undefined;

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'El usuario ya existe. Por favor, contacte al administrador.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: UserRole.Invitado,
        lastLogin: new Date(),
        passwordHash: await bcrypt.hash(password, 10),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e: any) {
    // Duplicado único por email
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json(
        { ok: false, message: 'El usuario ya existe. Por favor, contacte al administrador.' },
        { status: 409 }
      );
    }

    const rawMessage = e instanceof Error ? e.message : String(e);

    // Prisma no puede cargar la DATABASE_URL
    if (rawMessage.includes('Environment variable not found: DATABASE_URL')) {
      return NextResponse.json(
        { ok: false, error: 'DATABASE_URL no está definida. Crea/actualiza .env y vuelve a intentar.' },
        { status: 500 }
      );
    }

    // No se puede alcanzar la base de datos
    if (rawMessage.includes("Can't reach database server")) {
      return NextResponse.json(
        { ok: false, error: 'No se puede conectar a la base de datos. ¿Está Postgres levantado? Verifica DATABASE_URL.' },
        { status: 500 }
      );
    }

    // Cliente de Prisma desactualizado respecto al schema (no reconoce passwordHash)
    if (rawMessage.includes('Unknown argument `passwordHash`')) {
      return NextResponse.json(
        { ok: false, error: 'El Prisma Client no reconoce `passwordHash`. Ejecuta `npx prisma generate` y aplica la migración (`npx prisma migrate dev`).' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: false, error: rawMessage || 'Error desconocido' }, { status: 500 });
  }
}