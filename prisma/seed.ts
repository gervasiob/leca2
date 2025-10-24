/**
 * Populates the database with initial data.
 *
 * This seeder script connects to the database using Prisma and performs the following actions:
 * 1.  Upserts roles from `src/lib/data.ts`, creating or updating them based on their names.
 * 2.  Upserts users, hashing their passwords for security. It links them to their corresponding roles.
 * 3.  Upserts clients.
 * 4.  Upserts products.
 * 5.  Upserts orders, ensuring they are linked to the correct client and user.
 * 6.  Upserts production batches.
 * 7.  Upserts order details, linking them to orders and products.
 * 8.  Upserts claims.
 *
 * The script uses `upsert` to prevent creating duplicate records on subsequent runs.
 * It's designed to be executed via the `prisma db seed` command.
 */
import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import {
  roles as seedRoles,
  users as seedUsers,
  clients as seedClients,
  products as seedProducts,
  orders as seedOrders,
  productionBatches as seedBatches,
  orderDetails as seedDetails,
  claims as seedClaims,
} from '../src/lib/data';
import bcrypt from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Helper to map role names from data file to the enum in Prisma schema
const roleNameToEnum = (roleName: string): UserRole => {
  const mapping: { [key: string]: UserRole } = {
    Admin: UserRole.Admin,
    Sales: UserRole.Sales,
    Production: UserRole.Production,
    Invitado: UserRole.Invitado,
  };
  return mapping[roleName] || UserRole.Invitado;
};

const passwordForRole = (
  role: 'Admin' | 'Sales' | 'Production' | 'Invitado'
) =>
  role === 'Admin'
    ? 'admin'
    : role === 'Sales'
    ? 'ventas'
    : role === 'Production'
    ? 'produccion'
    : 'invitado';

async function main() {
  console.log('Start seeding...');

  // 1. Seed Roles
  for (const role of seedRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
      },
    });
  }
  console.log('Roles seeded.');

  // 2. Seed Users
  for (const user of seedUsers) {
    const role = await prisma.role.findFirst({
      where: { name: { equals: user.role, mode: 'insensitive' } },
    });
    if (!role) {
      console.warn(`Role "${user.role}" not found for user "${user.name}". Skipping.`);
      continue;
    }
    const password = passwordForRole(user.role);
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: roleNameToEnum(user.role),
        lastLogin: user.lastLogin,
        passwordHash,
        roleId: role.id,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleNameToEnum(user.role),
        lastLogin: user.lastLogin,
        passwordHash,
        roleId: role.id,
      },
    });
  }
  console.log('Users seeded.');

  // 3. Seed Clients
  for (const client of seedClients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: { ...client },
      create: client,
    });
  }
  console.log('Clients seeded.');

  // 4. Seed Products
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ...product },
      create: product,
    });
  }
  console.log('Products seeded.');

  // 5. Seed Orders
  for (const order of seedOrders) {
    const client = await prisma.client.findUnique({ where: { id: order.clientId } });
    const user = await prisma.user.findUnique({ where: { id: order.userId } });

    if (!client || !user) {
      console.warn(`Client or User not found for order ${order.id}. Skipping.`);
      continue;
    }

    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        clientId: order.clientId,
        userId: order.userId,
        status: order.status,
        totalAmount: new Decimal(order.totalAmount),
        orderDate: order.orderDate,
        isPartial: order.isPartial,
      },
      create: {
        id: order.id,
        clientId: order.clientId,
        userId: order.userId,
        status: order.status,
        totalAmount: new Decimal(order.totalAmount),
        orderDate: order.orderDate,
        isPartial: order.isPartial,
      },
    });
  }
  console.log('Orders seeded.');
  
  // 6. Ensure all orders from orderDetails exist before seeding details
  const detailOrderIds = [...new Set(seedDetails.map(d => d.orderId))];
  for (const orderId of detailOrderIds) {
    const orderExists = await prisma.order.findUnique({ where: { id: orderId }});
    if (!orderExists) {
        // Find a representative detail to get client/user info
        const detail = seedDetails.find(d => d.orderId === orderId)!;
        const client = await prisma.client.findUnique({ where: { id: detail.clientId }});
        
        // Find a default user if no specific user is associated
        const user = await prisma.user.findFirst({ where: { role: 'Sales' } });
        if (!user || !client) continue;

        const totalAmount = seedDetails.filter(d => d.orderId === orderId).reduce((sum, item) => sum + item.totalPrice, 0);

        await prisma.order.create({
            data: {
                id: orderId,
                clientId: client.id,
                userId: user.id,
                status: 'pending',
                totalAmount: new Decimal(totalAmount),
                orderDate: new Date(),
                isPartial: false
            }
        })
        console.log(`Created missing order #${orderId}`);
    }
  }


  // 7. Seed Production Batches
  for (const batch of seedBatches) {
    await prisma.productionBatch.upsert({
      where: { id: batch.id },
      update: {
        ...batch,
        items: undefined, // Relation handled separately
      },
      create: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        productionDate: batch.productionDate,
        plannedDate: batch.plannedDate,
        status: batch.status,
      },
    });
  }
  console.log('Production batches seeded.');

  // 8. Seed Order Details
  for (const detail of seedDetails) {
    // Remove properties not in the OrderDetail model
    const { productName, type, application, ...restOfDetail } = detail;
    await prisma.orderDetail.upsert({
      where: { id: detail.id },
      update: {
        ...restOfDetail,
        unitPrice: new Decimal(detail.unitPrice),
        totalPrice: new Decimal(detail.totalPrice),
      },
      create: {
        ...restOfDetail,
        unitPrice: new Decimal(detail.unitPrice),
        totalPrice: new Decimal(detail.totalPrice),
      },
    });
  }
  console.log('Order details seeded.');

  // 9. Seed Claims
  for (const claim of seedClaims) {
    // Remove property not in the Claim model
    const { clientName, ...restOfClaim } = claim;
    await prisma.claim.upsert({
        where: { id: claim.id },
        update: restOfClaim,
        create: restOfClaim,
    })
  }
  console.log('Claims seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
