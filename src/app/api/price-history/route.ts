import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { priceListsStore, priceHistoryStore } from '@/lib/dev-store';

// GET /api/price-history?listId=ID&productId=ID
// Dev-only endpoint: compone historial con precios de órdenes y el precio actual de la lista
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const listId = Number(searchParams.get('listId'));
    const productId = Number(searchParams.get('productId'));

    if (!listId || isNaN(listId)) {
      return NextResponse.json({ ok: false, error: 'listId inválido' }, { status: 400 });
    }
    if (!productId || isNaN(productId)) {
      return NextResponse.json({ ok: false, error: 'productId inválido' }, { status: 400 });
    }

    // Historial desde cambios de lista (por listId + productId)
    const key = `${listId}:${productId}`;
    const raw = priceHistoryStore.data[key] ?? [];
    const entries: { date: string; price: number; source: 'list' }[] = raw.map(e => ({ ...e, source: 'list' }));

    // Fallback: incluir precio actual si no hay historial
    if (entries.length === 0) {
      const pl = priceListsStore.data.find(l => l.id === listId);
      const currentPrice = pl?.prices?.[productId];
      if (typeof currentPrice === 'number') {
        entries.push({ date: new Date().toISOString(), price: currentPrice, source: 'list' });
      }
    }

    // Ordena por fecha descendente (más reciente primero)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ ok: true, history: entries }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}