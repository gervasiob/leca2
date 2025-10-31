import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

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
      // Map from Spanish UI name to English Enum value
      const roleNameMap: Record<string, UserRole> = {
        'Admin': UserRole.Admin,
        'Ventas': UserRole.Sales,
        'Producción': UserRole.Production,
        'Invitado': UserRole.Guest,
        'System': UserRole.System,
      };
      
      const enumRole = roleNameMap[roleInput];
      if (!enumRole) {
        return NextResponse.json({ ok: false, error: 'Rol inválido' }, { status: 400 });
      }
      data.role = enumRole;

      // Find Role in table by its Spanish name to get the ID
      const roleRow = await prisma.role.findFirst({ where: { name: roleInput } });
      if (!roleRow) {
        return NextResponse.json({ ok: false, error: `El rol '${roleInput}' no existe en la tabla de roles. Ejecute el seeder.` }, { status: 400 });
      }
      data.roleId = roleRow.id;
    }

    const updated = await prisma.user.update({
      where: { id: idNum },
      data,
    });
    
    // Map back to Spanish for the response to be consistent with UI
     const spanishRoleName = (await prisma.role.findUnique({ where: { id: updated.roleId } }))?.name || updated.role;

    const userResponse = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: spanishRoleName,
      lastLogin: updated.lastLogin.toISOString(),
    };

    return NextResponse.json({ ok: true, user: userResponse }, { status: 200 });
  } catch (e: any) {
    const msg = e?.code === 'P2002' ? 'Email ya está en uso' : (e?.message || 'Error al actualizar');
    console.error('Users PATCH error:', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
