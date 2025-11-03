
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    type: z.string().min(3, 'El tipo debe tener al menos 3 caracteres'),
    application: z.string().min(3, 'La aplicación debe tener al menos 3 caracteres'),
    colors: z.array(z.string()).min(1, 'Debe haber al menos un color'),
});
  
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ ok: false, error: 'ID de producto inválido' }, { status: 400 });
        }
        
        const body = await request.json();
        const validation = productSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ ok: false, error: validation.error.format() }, { status: 400 });
        }

        const { name, type, application, colors } = validation.data;

        // Check if another product with the same name exists
        const existing = await prisma.product.findFirst({ where: { name, NOT: { id } } });
        if (existing) {
            return NextResponse.json({ ok: false, error: 'Ya existe otro producto con ese nombre.' }, { status: 409 });
        }

        const product = await prisma.product.update({
            where: { id },
            data: { name, type, application, colors },
        });

        return NextResponse.json({ ok: true, product });

    } catch (error) {
        return NextResponse.json({ ok: false, error: 'Error al actualizar el producto.' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ ok: false, error: 'ID de producto inválido' }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        if (error.code === 'P2003') { // Foreign key constraint failed
            return NextResponse.json({ ok: false, error: 'No se puede eliminar el producto porque está asociado a pedidos existentes.' }, { status: 409 });
        }
        return NextResponse.json({ ok: false, error: 'Error al eliminar el producto.' }, { status: 500 });
    }
}
