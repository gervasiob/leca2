import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('auth_user')?.value;
  if (!raw) {
    return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
  }
  try {
    const user = JSON.parse(raw);
    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Sesión inválida' }, { status: 401 });
  }
}