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
    Sales: UserRole.Ventas,
    Production: UserRole.Produccion,
    Invitado: UserRole.Invitado,
    System: UserRole.System,
  };
  return mapping[roleName] || UserRole.Invitado;
};

// Map display names used in roles seed (es/en)
const roleDisplayName = (roleName: string): string => {
  const mapping: Record<string, string> = {
    Admin: 'Admin',
    Sales: 'Ventas',
    Production: 'Produccion',
    Invitado: 'Invitado',
    System: 'System',
  };
  return mapping[roleName] || roleName;
};
const passwordForRole = (
  role: 'Admin' | 'Sales' | 'Production' | 'Invitado' | 'System'
) =>
  role === 'Admin'
    ? 'admin'
    : role === 'Sales'
    ? 'ventas'
    : role === 'Production'
    ? 'produccion'
    : role === 'System'
    ? 'system'
    : 'invitado';

async function main() {
  console.log('Start seeding...');
  
  // Clean up existing data
  await prisma.claim.deleteMany({});
  await prisma.orderDetail.deleteMany({});
  await prisma.productionBatch.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  console.log('Cleared existing data.');

  // 1. Seed Roles
  for (const role of seedRoles) {
    await prisma.role.create({
      data: {
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
      where: { name: { equals: roleDisplayName(user.role), mode: 'insensitive' } },
    });
    if (!role) {
      console.warn(`Role "${user.role}" not found for user "${user.name}". Skipping.`);
      continue;
    }
    const password = passwordForRole(user.role as 'Admin' | 'Sales' | 'Production' | 'Invitado' | 'System');
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
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
    await prisma.client.create({
      data: { 
        id: client.id,
        name: client.name,
        cuit: client.cuit,
        address: client.address,
        phone: client.phone,
        email: client.email,
        discountLevel: client.discountLevel,
        canEditPrices: client.canEditPrices,
        commissionFee: client.commissionFee,
        sellsOnInstallments: client.sellsOnInstallments,
      },
    });
  }
  console.log('Clients seeded.');

  // 4. Seed Products
  for (const product of seedProducts) {
    await prisma.product.create({
      data: { 
        id: product.id,
        name: product.name,
        type: product.type,
        application: product.application,
        colors: product.colors,
        status: product.status,
      },
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

    await prisma.order.create({
      data: {
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
        const detail = seedDetails.find(d => d.orderId === orderId)!;
        const client = await prisma.client.findUnique({ where: { id: detail.clientId }});
        const user = await prisma.user.findFirst({ where: { role: UserRole.Ventas } });
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
    await prisma.productionBatch.create({
      data: {
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
    await prisma.orderDetail.create({
      data: {
        id: detail.id,
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: new Decimal(detail.unitPrice),
        totalPrice: new Decimal(detail.totalPrice),
        orderId: detail.orderId,
        clientId: detail.clientId,
        cartId: detail.cartId ?? null,
        paymentId: detail.paymentId ?? null,
        deliveryNoteId: detail.deliveryNoteId ?? null,
        batchId: detail.batchId ?? null,
        status: detail.status,
        isProduced: detail.isProduced,
        productionDate: detail.productionDate ?? null,
        productionDoneDate: detail.productionDoneDate ?? null,
        dispatchReadyDate: detail.dispatchReadyDate ?? null,
        dispatchedDate: detail.dispatchedDate ?? null,
        deliveryNoteDate: detail.deliveryNoteDate ?? null,
      },
    });
  }
  console.log('Order details seeded.');

  // 9. Seed Claims
  for (const claim of seedClaims) {
    await prisma.claim.create({
        data: {
            id: claim.id,
            orderDetailId: claim.orderDetailId,
            orderId: claim.orderId,
            clientId: claim.clientId,
            reason: claim.reason,
            status: claim.status,
            resolution: claim.resolution ?? null,
            createdAt: claim.createdAt,
        }
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
