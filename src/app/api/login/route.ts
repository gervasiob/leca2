import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailRaw: string | undefined = body?.email?.toString();
    const passwordRaw: string | undefined = body?.password?.toString();
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const password = passwordRaw ? passwordRaw.trim() : undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Actualizar último inicio de sesión
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { lastLogin: Timestamp.now() });

    // Excluir passwordHash del payload
    const { passwordHash, ...payload } = user;
    const serializablePayload = {
      ...payload,
      lastLogin: user.lastLogin?.toDate?.().toISOString() || new Date().toISOString(),
    }

    const res = NextResponse.json({ ok: true, user: serializablePayload }, { status: 200 });
    res.cookies.set('auth_user', JSON.stringify(serializablePayload), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;

  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error("Login error:", message);
    return NextResponse.json({ ok: false, error: 'Error del servidor al intentar iniciar sesión.' }, { status: 500 });
  }
}
