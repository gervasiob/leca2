import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  // Se cambia la condición para que la ruta de desarrollo solo esté disponible
  // cuando el middleware de producción está deshabilitado.
  if (process.env.MIDDLEWARE_ENABLED === 'true') {
    return NextResponse.json(
      { ok: false, error: 'This endpoint is only available when the middleware is disabled.' },
      { status: 403 }
    );
  }

  try {
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
