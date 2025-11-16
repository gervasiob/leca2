import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('auth_user')?.value;
    if (!raw) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {}
    const id = Number(parsed?.id);
    if (!id) return NextResponse.json({ ok: false, error: 'Usuario inválido' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
    if (!user) return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}