import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

// Lista de modelos permitidos para evitar acceso arbitrario
const allowedModels = [
  'user',
  'role',
  'client',
  'product',
  'order',
  'orderDetail',
  'productionBatch',
  'claim',
];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authUserCookie = cookieStore.get('auth_user')?.value;
    
    if (!authUserCookie) {
      return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
    }

    const user: User = JSON.parse(authUserCookie);

    if (user.role !== 'System') {
      return NextResponse.json({ ok: false, error: 'Access denied. System role required.' }, { status: 403 });
    }

    const body = await request.json();
    const tableName = body.tableName;

    if (!tableName || typeof tableName !== 'string') {
      return NextResponse.json({ ok: false, error: 'Table name is required.' }, { status: 400 });
    }

    if (!allowedModels.includes(tableName)) {
      return NextResponse.json({ ok: false, error: `Table '${tableName}' is not accessible.` }, { status: 403 });
    }

    // Acceso dinámico al modelo de Prisma
    const model = (prisma as any)[tableName];

    if (!model) {
      return NextResponse.json({ ok: false, error: `Model '${tableName}' not found in Prisma client.` }, { status: 404 });
    }

    const data = await model.findMany();

    // Prisma devuelve BigInt para los campos `bigint`. Estos no son serializables a JSON por defecto.
    // Lo convertimos a string para la visualización.
    const serializableData = JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));

    return NextResponse.json({ ok: true, data: serializableData });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Unknown server error';
    console.error('DB Viewer Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
