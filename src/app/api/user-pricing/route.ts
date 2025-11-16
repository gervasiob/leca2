import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// List all user pricing configs; restrict to Admin/System
export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { role?: string };
    const isPrivileged = me.role === 'Admin' || me.role === 'System';
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, priceListId: true, specialDiscountPct: true },
    });
    const result = users.map(u => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      priceListId: typeof u.priceListId === 'number' ? u.priceListId : 1,
      specialDiscountPct: typeof u.specialDiscountPct === 'number' ? u.specialDiscountPct : 0,
    }));
    return NextResponse.json({ ok: true, configs: result }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('user-pricing GET error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}