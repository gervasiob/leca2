import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    // Realiza una consulta simple para verificar la conexión, como listar colecciones.
    // O intenta leer un documento conocido. Por simplicidad, asumimos que si no hay error, está ok.
    const rolesCol = collection(db, 'roles');
    await getDocs(rolesCol);

    return NextResponse.json({ ok: true, now: new Date().toISOString() });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error connecting to Firestore';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
