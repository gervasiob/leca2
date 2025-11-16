import { NextResponse } from 'next/server';
import { priceListsStore, priceHistoryStore, PriceHistoryEntry } from '@/lib/dev-store';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  prices: z.record(z.string(), z.number()).optional(),
  statuses: z.record(z.string(), z.enum(['active', 'inactive'])).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { role?: string };
    const isPrivileged = me.role === 'Admin' || me.role === 'System';
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });

    const id = parseInt(params.id, 10);
    if (!id || isNaN(id)) return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    // Try DB first
    try {
      // Update name
      if (typeof parsed.name === 'string') {
        await prisma.$executeRaw`UPDATE "price_lists" SET name = ${parsed.name} WHERE id = ${id}`;
      }
      // Update prices
      if (parsed.prices) {
        for (const [k, v] of Object.entries(parsed.prices)) {
          const productId = Number(k);
          if (isNaN(productId)) continue;
          // Registrar historial en store dev
          const key = `${id}:${productId}`;
          const arr = priceHistoryStore.data[key] ?? [];
          const entry: PriceHistoryEntry = { date: new Date().toISOString(), price: v };
          priceHistoryStore.data[key] = [...arr, entry];

          await prisma.$executeRaw`INSERT INTO "price_list_items" ("priceListId", "productId", price) VALUES (${id}, ${productId}, ${v}) ON CONFLICT ("priceListId","productId") DO UPDATE SET price = EXCLUDED.price`;
        }
      }
      // Update statuses: prefer UPDATE; if row not exists, insert with price 0
      if (parsed.statuses) {
        for (const [k, st] of Object.entries(parsed.statuses)) {
          const productId = Number(k);
          if (isNaN(productId)) continue;
          const updatedRows = await prisma.$queryRaw<{ productId: number }[]>`UPDATE "price_list_items" SET status = ${st} WHERE "priceListId" = ${id} AND "productId" = ${productId} RETURNING "productId"`;
          if (!updatedRows || updatedRows.length === 0) {
            await prisma.$executeRaw`INSERT INTO "price_list_items" ("priceListId", "productId", price, status) VALUES (${id}, ${productId}, ${0}, ${st}) ON CONFLICT ("priceListId","productId") DO UPDATE SET status = EXCLUDED.status`;
          }
        }
      }
      // Build response from DB
      const rawList = await prisma.$queryRaw<{ id: number; name: string }[]>`SELECT id, name FROM "price_lists" WHERE id = ${id}`;
      const rawItems = await prisma.$queryRaw<{ priceListId: number; productId: number; price: any, status: string }[]>`SELECT "priceListId", "productId", price, status FROM "price_list_items" WHERE "priceListId" = ${id}`;
      const prices: Record<number, number> = {};
      const statuses: Record<number, string> = {};
      for (const it of rawItems) {
        const p = Number(it.price);
        prices[it.productId] = isNaN(p) ? 0 : p;
        statuses[it.productId] = it.status || 'active';
      }
      const updated = { id: rawList?.[0]?.id ?? id, name: rawList?.[0]?.name ?? (typeof parsed.name === 'string' ? parsed.name : (priceListsStore.data.find(l => l.id === id)?.name || '')), prices, statuses };
      return NextResponse.json({ ok: true, priceList: updated }, { status: 200 });
    } catch {
      // Fallback to dev-store
      const idx = priceListsStore.data.findIndex(l => l.id === id);
      if (idx === -1) return NextResponse.json({ ok: false, error: 'Lista no encontrada' }, { status: 404 });
      const next = { ...priceListsStore.data[idx] };
      if (typeof parsed.name === 'string') next.name = parsed.name;
      if (parsed.prices) {
        const merged: Record<number, number> = { ...next.prices };
        for (const [k, v] of Object.entries(parsed.prices)) {
          const idNum = Number(k);
          if (!isNaN(idNum)) {
            const prev = merged[idNum];
            merged[idNum] = v;
            if (typeof prev === 'number' ? prev !== v : true) {
              const key = `${id}:${idNum}`;
              const arr = priceHistoryStore.data[key] ?? [];
              const entry: PriceHistoryEntry = { date: new Date().toISOString(), price: v };
              priceHistoryStore.data[key] = [...arr, entry];
            }
          }
        }
        next.prices = merged;
      }
      priceListsStore.data[idx] = next;
      return NextResponse.json({ ok: true, priceList: next }, { status: 200 });
    }
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    const me = JSON.parse(raw) as { role?: string };
    const isPrivileged = me.role === 'Admin' || me.role === 'System';
    if (!isPrivileged) return NextResponse.json({ ok: false, error: 'Acceso denegado' }, { status: 403 });

    const id = parseInt(params.id, 10);
    if (!id || isNaN(id)) return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    try {
      await prisma.$executeRaw`DELETE FROM "price_list_items" WHERE "priceListId" = ${id}`;
      await prisma.$executeRaw`DELETE FROM "price_lists" WHERE id = ${id}`;
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch {
      const idx = priceListsStore.data.findIndex(l => l.id === id);
      if (idx === -1) return NextResponse.json({ ok: false, error: 'Lista no encontrada' }, { status: 404 });
      priceListsStore.data.splice(idx, 1);
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}