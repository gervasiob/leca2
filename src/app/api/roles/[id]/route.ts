import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const nameRaw: unknown = body?.name;
    const permissionsRaw: unknown = body?.permissions;

    const data: { name?: string; permissions?: string[] } = {};

    if (typeof nameRaw === 'string') {
      data.name = nameRaw.trim();
    }
    if (Array.isArray(permissionsRaw)) {
      data.permissions = (permissionsRaw as unknown[]).map((p) => String(p));
    }

    if (!('name' in data) && !('permissions' in data)) {
      return NextResponse.json({ ok: false, error: 'No hay cambios para actualizar' }, { status: 400 });
    }

    const role = await prisma.role.update({ where: { id }, data });
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
      message = 'Ya existe un rol con ese nombre';
    }
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    if (message?.toLowerCase().includes('record to delete does not exist')) {
      status = 404;
      message = 'Rol no encontrado';
    }
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}