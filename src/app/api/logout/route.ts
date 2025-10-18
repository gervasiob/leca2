import { NextResponse } from 'next/server';

function makeResponse() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  // Elimina la cookie de autenticación
  try {
    // Borrado explícito
    res.cookies.delete('auth_user');
  } catch {}
  // Asegurar expiración por compatibilidad
  res.cookies.set('auth_user', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export async function POST() {
  return makeResponse();
}

export async function GET() {
  return makeResponse();
}