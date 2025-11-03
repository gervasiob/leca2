
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
      return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 400 });
    }

    const { name, type, application, colors } = validation.data;

    const existingProduct = await prisma.product.findUnique({ where: { name } });
    if (existingProduct) {
        return NextResponse.json({ ok: false, error: 'Ya existe un producto con este nombre.' }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        application,
        colors,
        status: 'active' // Default status
      },
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ ok: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Error al crear el producto.' }, { status: 500 });
  }
}
