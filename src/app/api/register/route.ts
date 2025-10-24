import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/types';
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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: 'El usuario ya existe. Por favor, contacte al administrador.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const invitadoRole = await prisma.role.findFirst({
        where: { name: 'Invitado' }
    });

    if (!invitadoRole) {
        return NextResponse.json({ok: false, error: "El rol 'Invitado' no existe. Ejecute el seeder."}, {status: 500});
    }

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            role: UserRole.Invitado,
            passwordHash,
            roleId: invitadoRole.id,
            lastLogin: new Date(),
        }
    });
    
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json({ ok: true, user: userResponse }, { status: 201 });
  } catch (e: any) {
    const rawMessage = e instanceof Error ? e.message : String(e);
    console.error("Register error:", rawMessage);
    return NextResponse.json({ ok: false, error: 'Error del servidor al registrar el usuario.' }, { status: 500 });
  }
}
