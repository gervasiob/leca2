import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const passwordForRole = (role: UserRole) =>
  role === 'Admin' ? 'admin' :
  role === 'Sales' ? 'ventas' :
  role === 'Production' ? 'produccion' : 'invitado';

async function main() {
  const toUpdate = await prisma.user.findMany({ where: { passwordHash: null } });
  console.log(`Usuarios a backfillear: ${toUpdate.length}`);
  for (const u of toUpdate) {
    const plain = passwordForRole(u.role);
    const hash = await bcrypt.hash(plain, 10);
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hash } });
    console.log(`Usuario ${u.email} actualizado`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Backfill completo');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });