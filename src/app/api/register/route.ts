
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  console.log('INFO: Registro de usuario iniciado...');
  try {
    const body = await request.json();
    console.log('INFO: Datos recibidos:', body);

    const name: string | undefined = body?.name?.toString().trim();
    const emailRaw: string | undefined = body?.email?.toString();
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const passwordRaw: string | undefined = body?.password?.toString();
    const password = passwordRaw ? passwordRaw.trim() : undefined;

    if (!name || !email || !password) {
      console.error('ERROR: Faltan campos obligatorios.');
      return NextResponse.json(
        { ok: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.error('ERROR: La contraseña es demasiado corta.');
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('INFO: Buscando si el usuario ya existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.warn('WARN: Intento de registro de un email ya existente:', email);
      return NextResponse.json(
        { ok: false, message: 'El usuario ya existe. Por favor, contacte al administrador.' },
        { status: 409 }
      );
    }
    console.log('INFO: El usuario no existe, procediendo con la creación.');

    const passwordHash = await bcrypt.hash(password, 10);
    console.log('INFO: Hash de contraseña generado.');

    const guestRole = await prisma.role.findFirst({
        where: { name: 'Guest' }
    });

    if (!guestRole) {
        console.error("ERROR: El rol 'Guest' no se encontró en la base de datos.");
        return NextResponse.json({ok: false, error: "El rol 'Guest' no existe. Ejecute el seeder."}, {status: 500});
    }
    console.log('INFO: Rol "Guest" encontrado con ID:', guestRole.id);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: UserRole.Guest, // Asignar el enum
            roleId: guestRole.id, // Asignar el ID de la relación
            lastLogin: new Date(),
        }
    });
    console.log('INFO: Nuevo usuario creado con éxito:', newUser.id);

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json({ ok: true, user: userResponse }, { status: 201 });
  } catch (e: any) {
    const rawMessage = e instanceof Error ? e.message : String(e);
    console.error("ERROR: Fallo en la API de registro:", rawMessage);
    return NextResponse.json({ ok: false, error: 'Error del servidor al registrar el usuario.' }, { status: 500 });
  }
}
