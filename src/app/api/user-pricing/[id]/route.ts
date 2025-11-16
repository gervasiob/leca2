import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { role?: string };
    const isPrivileged = me.role === 'Admin' || me.role === 'System';
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });

    const id = parseInt(params.id, 10);
    if (!id || isNaN(id)) return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const priceListId = Number(body?.priceListId);
    const specialDiscountPct = Number(body?.specialDiscountPct);
    if (!priceListId || isNaN(priceListId)) {
      return NextResponse.json({ ok: false, error: 'priceListId inválido' }, { status: 400 });
    }
    if (isNaN(specialDiscountPct) || specialDiscountPct < 0 || specialDiscountPct > 100) {
      return NextResponse.json({ ok: false, error: 'specialDiscountPct inválido (0-100)' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 });
    }
    const plExists = await prisma.priceList.findUnique({ where: { id: priceListId } });
    if (!plExists) {
      return NextResponse.json({ ok: false, error: 'Lista de precios inexistente' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { priceListId, specialDiscountPct },
      select: { id: true, priceListId: true, specialDiscountPct: true },
    });
    return NextResponse.json({ ok: true, config: updated }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('user-pricing PATCH error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}