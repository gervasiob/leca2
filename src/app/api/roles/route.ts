import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
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

    // Pre-check duplicados por nombre (case-insensitive)
    const existsInsensitive = await prisma.role.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    if (existsInsensitive) {
      return NextResponse.json({ ok: false, error: 'Ya existe un rol con ese nombre.' }, { status: 409 });
    }
    // Crear rol
    const role = await prisma.role.create({ data: { name, permissions } });
    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    if (message?.toLowerCase().includes('unique')) {
      message = 'Ya existe un rol con ese nombre.';
      status = 409;
    }
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idRaw: unknown = body?.id;
    const nameRaw: unknown = body?.name;
    const permissionsRaw: unknown = body?.permissions;

    const idNum =
      typeof idRaw === 'number'
        ? idRaw
        : typeof idRaw === 'string'
        ? Number.parseInt(idRaw, 10)
        : NaN;
    const name = typeof nameRaw === 'string' ? nameRaw.trim() : undefined;
    const permissions = Array.isArray(permissionsRaw)
      ? (permissionsRaw as unknown[]).map((p) => String(p))
      : undefined;

    const hasValidId = !Number.isNaN(idNum);

    if (!hasValidId) {
      // Crear nuevo rol cuando no hay id válido
      if (!name) {
        return NextResponse.json(
          { ok: false, error: 'El nombre del rol es obligatorio.' },
          { status: 400 }
        );
      }
      // Pre-check duplicados por nombre (case-insensitive)
      const existsInsensitive = await prisma.role.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (existsInsensitive) {
        return NextResponse.json(
          { ok: false, error: 'Ya existe un rol con ese nombre.' },
          { status: 409 }
        );
      }
      const role = await prisma.role.create({
        data: { name, permissions: permissions ?? [] },
      });
      return NextResponse.json({ ok: true, role }, { status: 201 });
    }

    // Actualizar rol existente cuando llega un id válido
    const data: { name?: string; permissions?: string[] } = {};
    if (typeof name === 'string') data.name = name;
    if (Array.isArray(permissions)) data.permissions = permissions;

    if (!('name' in data) && !('permissions' in data)) {
      return NextResponse.json(
        { ok: false, error: 'No hay cambios para actualizar' },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({ where: { id: idNum }, data });
    return NextResponse.json({ ok: true, role }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    if (message?.toLowerCase().includes('record to update not found')) {
      status = 404;
      message = 'Rol no encontrado';
    }
    if (message?.toLowerCase().includes('unique')) {
      status = 409;
      message = 'Ya existe un rol con ese nombre.';
    }
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}