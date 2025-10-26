import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });

    const sanitized = users.map(({ passwordHash, ...u }) => ({
      ...u,
      lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
    }));

    return NextResponse.json({ ok: true, users: sanitized }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('Error fetching users:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}