import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return NextResponse.json({ ok: true, roles }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nameRaw: unknown = body?.name;
    const permissionsRaw: unknown = body?.permissions;

    const name = typeof nameRaw === 'string' ? nameRaw.trim() : '';
    const permissions = Array.isArray(permissionsRaw)
      ? (permissionsRaw as unknown[]).map((p) => String(p))
      : [];

    if (!name) {
      return NextResponse.json(
        { ok: false, error: 'El nombre del rol es obligatorio.' },
        { status: 400 }
      );
    }
    
    const existingRole = await prisma.role.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingRole) {
        return NextResponse.json({ ok: false, error: 'Ya existe un rol con ese nombre.' }, { status: 409 });
    }

    const role = await prisma.role.create({
        data: { name, permissions }
    });

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    console.error("Error creating role:", message);
    return NextResponse.json({ ok: false, error: 'Error del servidor al crear el rol.' }, { status: 500 });
  }
}
