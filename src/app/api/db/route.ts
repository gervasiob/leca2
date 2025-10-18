import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ now: Date }>(
      Prisma.sql`SELECT NOW() as now`
    );
    return NextResponse.json({ ok: true, now: (rows as unknown as { now: Date }[])[0]?.now ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}