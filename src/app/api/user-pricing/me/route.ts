import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Current user's pricing config
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { id: number };
    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { priceListId: true, specialDiscountPct: true },
    });
    const priceListId = typeof user?.priceListId === 'number' ? user!.priceListId : 1;
    const specialDiscountPct = typeof user?.specialDiscountPct === 'number' ? user!.specialDiscountPct : 0;

    let priceList: { id: number; name: string; prices: Record<number, number> } | null = null;
    try {
      const rawList = await prisma.priceList.findUnique({ where: { id: priceListId }, select: { id: true, name: true } });
      const url = new URL(req.url);
      const statusParam = url.searchParams.get('status');
      const onlyActive = statusParam === 'active';
      const items = await prisma.priceListItem.findMany({ where: { priceListId, ...(onlyActive ? { status: 'active' } : {}) }, select: { productId: true, price: true } });
      const prices: Record<number, number> = {};
      for (const it of items) {
        prices[it.productId] = Number(it.price as any);
      }
      priceList = { id: rawList?.id ?? priceListId, name: rawList?.name ?? '', prices };
    } catch {}

    return NextResponse.json({ ok: true, config: { priceListId, specialDiscountPct }, priceList }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}