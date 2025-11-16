import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Client } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Persist with Prisma

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  cuit: z.string().min(5).optional(),
  address: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional(),
  discountLevel: z.number().int().min(0).optional(),
  canEditPrices: z.boolean().optional(),
  commissionFee: z.number().min(0).optional(),
  sellsOnInstallments: z.boolean().optional(),
  accessibleUserIds: z.array(z.number().int()).optional(),
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr, 10);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });
    }
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    // Determine role to decide whether to accept accessibleUserIds
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    let isPrivileged = false;
    if (raw) {
      try {
        const user = JSON.parse(raw) as { role?: UserRole };
        isPrivileged = user.role === UserRole.Admin || user.role === UserRole.System;
      } catch {}
    }
    const { accessibleUserIds, ...rest } = parsed;
    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(typeof rest.name === 'string' ? { name: rest.name } : {}),
        ...(typeof rest.cuit === 'string' ? { cuit: rest.cuit } : {}),
        ...(typeof rest.address === 'string' ? { address: rest.address } : {}),
        ...(typeof rest.phone === 'string' ? { phone: rest.phone } : {}),
        ...(typeof rest.email === 'string' ? { email: rest.email } : {}),
        ...(typeof rest.discountLevel === 'number' ? { discountLevel: rest.discountLevel } : {}),
        ...(typeof rest.canEditPrices === 'boolean' ? { canEditPrices: rest.canEditPrices } : {}),
        ...(typeof rest.commissionFee === 'number' ? { commissionFee: rest.commissionFee } : {}),
        ...(typeof rest.sellsOnInstallments === 'boolean' ? { sellsOnInstallments: rest.sellsOnInstallments } : {}),
      },
    });

    if (isPrivileged && Array.isArray(accessibleUserIds)) {
      await prisma.clientAccess.deleteMany({ where: { clientId: id } });
      if (accessibleUserIds.length > 0) {
        await prisma.clientAccess.createMany({
          data: accessibleUserIds.map(uid => ({ clientId: id, userId: uid })),
          skipDuplicates: true,
        });
      }
    }

    const access = await prisma.clientAccess.findMany({ where: { clientId: id }, select: { userId: true } });
    const response: Client = {
      id: updated.id,
      name: updated.name,
      cuit: updated.cuit,
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      discountLevel: updated.discountLevel,
      canEditPrices: updated.canEditPrices,
      commissionFee: updated.commissionFee,
      sellsOnInstallments: updated.sellsOnInstallments,
      accessibleUserIds: access.map(a => a.userId),
    };

    return NextResponse.json({ ok: true, client: response });
  } catch (e: any) {
    const message = e?.message || 'Error al actualizar cliente';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr, 10);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });
    }
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    let isPrivileged = false;
    try {
      const user = JSON.parse(raw) as { role?: UserRole };
      isPrivileged = user.role === UserRole.Admin || user.role === UserRole.System;
    } catch {}
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });
    await prisma.clientAccess.deleteMany({ where: { clientId: id } });
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const message = e?.message || 'Error al eliminar cliente';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}