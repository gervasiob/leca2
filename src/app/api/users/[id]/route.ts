import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const idNum = Number(params.id);
    if (!idNum || isNaN(idNum)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const emailRaw = typeof body?.email === 'string' ? body.email : undefined;
    const email = emailRaw ? emailRaw.trim().toLowerCase() : undefined;
    const roleInput = typeof body?.role === 'string' ? body.role.trim() : undefined;

    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;

    if (roleInput) {
      // Aceptar español o inglés y mapear al enum en español
      const roleMap: Record<string, keyof typeof UserRole> = {
        Admin: 'Admin',
        Sales: 'Ventas',
        Production: 'Producción',
        Invitado: 'Invitado',
        Ventas: 'Ventas',
        'Producción': 'Producción',
      };
      const mappedRole = roleMap[roleInput];
      if (!mappedRole) {
        return NextResponse.json({ ok: false, error: 'Rol inválido' }, { status: 400 });
      }
      data.role = (UserRole as any)[mappedRole];

      // Encontrar Role en tabla por nombre mostrado (español)
      const roleRow = await prisma.role.findFirst({ where: { name: data.role } });
      if (!roleRow) {
        return NextResponse.json({ ok: false, error: `El rol '${data.role}' no existe. Ejecute el seeder.` }, { status: 400 });
      }
      data.roleId = roleRow.id;
    }

    const updated = await prisma.user.update({
      where: { id: idNum },
      data,
    });

    const userResponse = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      lastLogin: updated.lastLogin.toISOString(),
    };

    return NextResponse.json({ ok: true, user: userResponse }, { status: 200 });
  } catch (e: any) {
    const msg = e?.code === 'P2002' ? 'Email ya está en uso' : (e?.message || 'Error al actualizar');
    console.error('Users PATCH error:', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}