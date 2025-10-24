import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de rol no proporcionado' }, { status: 400 });
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

    const roleRef = doc(db, 'roles', id);
    await updateDoc(roleRef, data);
    
    const updatedDoc = await getDoc(roleRef);
    const role = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ ok: true, role }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    if (e.code === 'not-found') {
        status = 404;
        message = 'Rol no encontrado';
    }
    console.error(`Error updating role ${params.id}:`, message);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de rol no proporcionado' }, { status: 400 });
    }

    const roleRef = doc(db, 'roles', id);
    await deleteDoc(roleRef);
    
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    if (e.code === 'not-found') {
        status = 404;
        message = 'Rol no encontrado';
    }
    console.error(`Error deleting role ${params.id}:`, message);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
