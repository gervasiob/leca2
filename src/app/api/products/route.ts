
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  type: z.string().min(3, 'El tipo debe tener al menos 3 caracteres'),
  application: z.string().min(3, 'La aplicación debe tener al menos 3 caracteres'),
  colors: z.array(z.string()).min(1, 'Debe haber al menos un color'),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
        orderBy: { id: 'asc' }
    });
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Error al obtener los productos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const msg = Array.isArray(validation.error.issues)
        ? validation.error.issues.map(i => i.message).join(', ')
        : 'Datos inválidos';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const { name, type, application, colors } = validation.data;

    const existingProduct = await prisma.product.findFirst({ where: { name } });
    if (existingProduct) {
        return NextResponse.json({ ok: false, error: 'Ya existe un producto con este nombre.' }, { status: 409 });
    }

    // Asegurar que la secuencia de IDs esté sincronizada con la tabla
    try {
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"public"."products"','id'), COALESCE((SELECT MAX(id) FROM "public"."products"), 0) + 1)`;
    } catch {}

    const product = await prisma.product.create({
      data: {
        name,
        type,
        application,
        colors,
        status: 'active' // Default status
      },
    });

    try {
      const lists = await prisma.priceList.findMany({ select: { id: true } });
      if (lists.length > 0) {
        await prisma.priceListItem.createMany({
          data: lists.map(l => ({ priceListId: l.id, productId: product.id, price: 0, status: 'inactive' })),
          skipDuplicates: true,
        });
      }
    } catch {}

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = Array.isArray(error.issues) ? error.issues.map(i => i.message).join(', ') : 'Datos inválidos';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Error al crear el producto.' }, { status: 500 });
  }
}
