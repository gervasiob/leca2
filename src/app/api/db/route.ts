import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    await prisma.role.findFirst();
    await prisma.$disconnect();
    return NextResponse.json({ ok: true, message: "Prisma connected successfully", now: new Date().toISOString() });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error connecting to Prisma';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
