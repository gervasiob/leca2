import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Client } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { clientsStore } from '@/lib/dev-store';

// Shared in-memory store during dev. Replace with Prisma for persistence.
let store: Client[] = clientsStore.data;

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
    const isAdmin = role === UserRole.Admin;
    const isSystem = role === UserRole.System;
    const result = (isAdmin || isSystem)
      ? store
      : store.filter(c => (c.accessibleUserIds || []).includes(user.id));
    return NextResponse.json({ ok: true, clients: result });
  } catch {
    return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = clientSchema.parse(body);
    const id = (store.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;
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
    const newClient: Client = {
      id,
      ...parsed,
      accessibleUserIds: isPrivileged ? parsed.accessibleUserIds : undefined,
    } as Client;
    store.push(newClient);
    return NextResponse.json({ ok: true, client: newClient });
  } catch (e: any) {
    const message = e?.message || 'Error al crear cliente';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}