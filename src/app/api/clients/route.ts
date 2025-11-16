import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Client } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { prisma } from '@/lib/prisma';

// Persist with Prisma

const clientSchema = z.object({
  name: z.string().min(2),
  cuit: z.string().min(5),
  address: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  discountLevel: z.number().int().min(0).default(1),
  canEditPrices: z.boolean().default(false),
  commissionFee: z.number().min(0).default(0),
  sellsOnInstallments: z.boolean().default(false),
  accessibleUserIds: z.array(z.number().int()).optional(),
});

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('auth_user')?.value;
  if (!raw) {
    return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
  }
  try {
    const user = JSON.parse(raw) as { id: number; role?: UserRole };
    const role = user?.role as UserRole | undefined;
    const isPrivileged = role === UserRole.Admin || role === UserRole.System;

    const clients = await prisma.client.findMany({
      where: isPrivileged ? undefined : { clientAccesses: { some: { userId: user.id } } },
      orderBy: { id: 'asc' },
      include: { clientAccesses: { select: { userId: true } } },
    });

    const response: Client[] = clients.map(c => ({
      id: c.id,
      name: c.name,
      cuit: c.cuit,
      address: c.address,
      phone: c.phone,
      email: c.email,
      discountLevel: c.discountLevel,
      canEditPrices: c.canEditPrices,
      commissionFee: c.commissionFee,
      sellsOnInstallments: c.sellsOnInstallments,
      accessibleUserIds: c.clientAccesses.map(a => a.userId),
    }));

    return NextResponse.json({ ok: true, clients: response });
  } catch {
    return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = clientSchema.parse(body);
    // Determine role to decide whether to accept accessibleUserIds
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    let isPrivileged = false;
    let requesterId: number | null = null;
    if (raw) {
      try {
        const user = JSON.parse(raw) as { id?: number; role?: UserRole };
        requesterId = typeof user.id === 'number' ? user.id : null;
        isPrivileged = user.role === UserRole.Admin || user.role === UserRole.System;
      } catch {}
    }
    const defaultAccess = requesterId ? [requesterId] : [];
    const accessibleIds = isPrivileged
      ? (parsed.accessibleUserIds && parsed.accessibleUserIds.length > 0 ? parsed.accessibleUserIds : defaultAccess)
      : defaultAccess;

    try {
      await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"public"."clients"','id'), COALESCE((SELECT MAX(id) FROM "public"."clients"), 0) + 1)`;
    } catch {}

    const created = await prisma.client.create({
      data: {
        name: parsed.name,
        cuit: parsed.cuit,
        address: parsed.address,
        phone: parsed.phone,
        email: parsed.email,
        discountLevel: parsed.discountLevel,
        canEditPrices: parsed.canEditPrices,
        commissionFee: parsed.commissionFee,
        sellsOnInstallments: parsed.sellsOnInstallments,
      },
    });

    if (accessibleIds.length > 0) {
      await prisma.clientAccess.createMany({
        data: accessibleIds.map(uid => ({ clientId: created.id, userId: uid })),
        skipDuplicates: true,
      });
    }

    const response: Client = {
      id: created.id,
      name: created.name,
      cuit: created.cuit,
      address: created.address,
      phone: created.phone,
      email: created.email,
      discountLevel: created.discountLevel,
      canEditPrices: created.canEditPrices,
      commissionFee: created.commissionFee,
      sellsOnInstallments: created.sellsOnInstallments,
      accessibleUserIds: accessibleIds,
    };

    return NextResponse.json({ ok: true, client: response });
  } catch (e: any) {
    const message = e?.message || 'Error al crear cliente';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}