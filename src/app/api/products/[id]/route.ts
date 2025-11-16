
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    type: z.string().min(3, 'El tipo debe tener al menos 3 caracteres').optional(),
    application: z.string().min(3, 'La aplicación debe tener al menos 3 caracteres').optional(),
    colors: z.array(z.string()).min(1, 'Debe haber al menos un color').optional(),
    status: z.enum(['active', 'inactive']).optional(),
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
            const msg = Array.isArray(validation.error.issues)
                ? validation.error.issues.map(i => i.message).join(', ')
                : 'Datos inválidos';
            return NextResponse.json({ ok: false, error: msg }, { status: 400 });
        }
        const { name, type, application, colors, status } = validation.data;

        if (typeof name === 'string') {
            const existing = await prisma.product.findFirst({ where: { name, NOT: { id } } });
            if (existing) {
                return NextResponse.json({ ok: false, error: 'Ya existe otro producto con ese nombre.' }, { status: 409 });
            }
        }

        const data: any = {};
        if (typeof name === 'string') data.name = name;
        if (typeof type === 'string') data.type = type;
        if (typeof application === 'string') data.application = application;
        if (Array.isArray(colors)) data.colors = colors;
        if (typeof status === 'string') data.status = status;

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        if (typeof status === 'string') {
            await prisma.priceListItem.updateMany({ where: { productId: id }, data: { status } });
        }

        return NextResponse.json({ ok: true, product });

    } catch (error) {
        return NextResponse.json({ ok: false, error: 'Error al actualizar el producto.' }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ ok: false, error: 'ID de producto inválido' }, { status: 400 });
        }
        const product = await prisma.product.update({
            where: { id },
            data: { status: 'inactive' },
        });
        await prisma.priceListItem.updateMany({ where: { productId: id }, data: { status: 'inactive' } });
        return NextResponse.json({ ok: true, product }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ ok: false, error: 'Error al marcar el producto como inactivo.' }, { status: 500 });
    }
}
