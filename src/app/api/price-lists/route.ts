import { NextResponse } from 'next/server';
import { priceListsStore } from '@/lib/dev-store';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    try {
      const rawLists = await prisma.$queryRaw<{ id: number; name: string }[]>`SELECT id, name FROM "price_lists" ORDER BY id ASC`;
      const rawItems = await prisma.$queryRaw<{ priceListId: number; productId: number; price: any, status: string }[]>`SELECT "priceListId", "productId", price, status FROM "price_list_items"`;
      const pricesByList: Record<number, Record<number, number>> = {};
      const statusesByList: Record<number, Record<number, string>> = {};
      for (const it of rawItems) {
        const p = Number(it.price);
        if (!pricesByList[it.priceListId]) pricesByList[it.priceListId] = {};
        if (!statusesByList[it.priceListId]) statusesByList[it.priceListId] = {};
        pricesByList[it.priceListId][it.productId] = isNaN(p) ? 0 : p;
        statusesByList[it.priceListId][it.productId] = it.status || 'active';
      }
      const result = rawLists.map(l => ({ id: l.id, name: l.name, prices: pricesByList[l.id] || {}, statuses: statusesByList[l.id] || {} }));
      return NextResponse.json({ ok: true, priceLists: result }, { status: 200 });
    } catch {
      const lists = priceListsStore.data;
      return NextResponse.json({ ok: true, priceLists: lists }, { status: 200 });
    }
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  prices: z.record(z.string(), z.number()).optional(),
  statuses: z.record(z.string(), z.enum(['active', 'inactive'])).optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { role?: string };
    const isPrivileged = me.role === 'Admin' || me.role === 'System';
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });

    const body = await req.json();
    const parsed = createSchema.parse(body);
    try {
      const created = await prisma.$queryRaw<{ id: number }[]>`INSERT INTO "price_lists" (name) VALUES (${parsed.name}) RETURNING id`;
      const id = created?.[0]?.id;
      if (!id) throw new Error('No se pudo crear lista en DB');
      if (parsed.prices) {
        for (const [k, v] of Object.entries(parsed.prices)) {
          const productId = Number(k);
          if (isNaN(productId)) continue;
          const st = parsed.statuses?.[k] ?? 'active';
          await prisma.$executeRaw`INSERT INTO "price_list_items" ("priceListId", "productId", price, status) VALUES (${id}, ${productId}, ${v}, ${st}) ON CONFLICT ("priceListId","productId") DO UPDATE SET price = EXCLUDED.price, status = EXCLUDED.status`;
        }
      }
      return NextResponse.json({ ok: true, priceList: { id, name: parsed.name, prices: parsed.prices ?? {}, statuses: parsed.statuses ?? {} } }, { status: 201 });
    } catch {
      // Fallback to dev-store
      const nextId = (priceListsStore.data.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;
      const prices: Record<number, number> = {};
      if (parsed.prices) {
        for (const [k, v] of Object.entries(parsed.prices)) {
          const idNum = Number(k);
          if (!isNaN(idNum)) prices[idNum] = v;
        }
      }
      const newList = { id: nextId, name: parsed.name, prices };
      priceListsStore.data.push(newList);
      return NextResponse.json({ ok: true, priceList: { ...newList, statuses: {} } }, { status: 201 });
    }
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}