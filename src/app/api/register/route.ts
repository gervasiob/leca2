import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { UserRole } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name: string | undefined = body?.name?.toString().trim();
    const emailRaw: string | undefined = body?.email?.toString();
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const passwordRaw: string | undefined = body?.password?.toString();
    const password = passwordRaw ? passwordRaw.trim() : undefined;

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { ok: false, message: 'El usuario ya existe. Por favor, contacte al administrador.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      role: UserRole.Invitado,
      lastLogin: Timestamp.now(),
      passwordHash,
    };

    const docRef = await addDoc(usersRef, newUser);
    
    const userResponse = {
      id: docRef.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json({ ok: true, user: userResponse }, { status: 201 });
  } catch (e: any) {
    const rawMessage = e instanceof Error ? e.message : String(e);
    console.error("Register error:", rawMessage);
    return NextResponse.json({ ok: false, error: 'Error del servidor al registrar el usuario.' }, { status: 500 });
  }
}
