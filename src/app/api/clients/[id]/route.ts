import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Client } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { clientsStore } from '@/lib/dev-store';
import { cookies } from 'next/headers';

// Use shared in-memory store as list route.
let store: Client[] = clientsStore.data;

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const idx = store.findIndex(c => c.id === id);
    if (idx === -1) {
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
    store[idx] = {
      ...store[idx],
      ...rest,
      ...(isPrivileged ? { accessibleUserIds } : {}),
    };
    return NextResponse.json({ ok: true, client: store[idx] });
  } catch (e: any) {
    const message = e?.message || 'Error al actualizar cliente';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}