import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID de rol inválido' }, { status: 400 });
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

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: 'No hay cambios para actualizar' }, { status: 400 });
    }

    const role = await prisma.role.update({
        where: { id },
        data
    });

    return NextResponse.json({ ok: true, role }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    console.error(`Error updating role ${params.id}:`, message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID de rol inválido' }, { status: 400 });
    }

    await prisma.role.delete({
        where: { id }
    });
    
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    console.error(`Error deleting role ${params.id}:`, message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
