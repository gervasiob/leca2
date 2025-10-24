import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

export async function GET() {
  try {
    const rolesCol = collection(db, 'roles');
    const roleSnapshot = await getDocs(rolesCol);
    const roles = roleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Firestore no garantiza el orden, así que lo ordenamos aquí si es necesario.
    roles.sort((a, b) => a.id - b.id);
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
    
    // Verificar si el rol ya existe (case-insensitive no es directo en Firestore)
    // Se normaliza al guardar y al consultar
    const rolesRef = collection(db, 'roles');
    const q = query(rolesRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return NextResponse.json({ ok: false, error: 'Ya existe un rol con ese nombre.' }, { status: 409 });
    }

    const newRole = { name, permissions };
    const docRef = await addDoc(rolesRef, newRole);

    const role = { id: docRef.id, ...newRole };

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch (e: any) {
    let message = e instanceof Error ? e.message : 'Error desconocido';
    let status = 500;
    console.error("Error creating role:", message);
    return NextResponse.json({ ok: false, error: 'Error del servidor al crear el rol.' }, { status });
  }
}
