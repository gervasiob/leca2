import { PrismaClient, Prisma, OrderStatus, OrderDetailStatus, ProductStatus, ProductionBatchStatus, ClaimStatus, UserRole } from '@prisma/client';
import { clients, products, orders, orderDetails, productionBatches, claims, users, roles } from '../src/lib/data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const passwordForRole = (role: UserRole) =>
  role === 'Admin' ? 'admin' :
  role === 'Sales' ? 'ventas' :
  role === 'Production' ? 'produccion' : 'invitado';

function mapOrderStatus(s: string): OrderStatus {
  switch (s) {
    case 'partial':
      return OrderStatus.partial;
    case 'complete':
      return OrderStatus.complete;
    case 'pending':
      return OrderStatus.pending;
    case 'in-production':
      return OrderStatus.in_production;
    default:
      return OrderStatus.pending;
  }
}

function mapBatchStatus(s: string): ProductionBatchStatus {
  switch (s) {
    case 'Planned':
      return ProductionBatchStatus.PLANNED;
    case 'In Progress':
      return ProductionBatchStatus.IN_PROGRESS;
    case 'Completed':
      return ProductionBatchStatus.COMPLETED;
    default:
      return ProductionBatchStatus.PLANNED;
  }
}

async function main() {
  // Limpieza para un seed determinístico
  await prisma.claim.deleteMany({});
  await prisma.orderDetail.deleteMany({});
  await prisma.productionBatch.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // Roles
  await prisma.role.createMany({
    data: roles.map((r) => ({ id: r.id, name: r.name, permissions: r.permissions })),
    skipDuplicates: true,
  });

  // Users
  await prisma.user.createMany({
    data: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role as UserRole, lastLogin: u.lastLogin, passwordHash: bcrypt.hashSync(passwordForRole(u.role as UserRole), 10) })),
    skipDuplicates: true,
  });

  // Clients
  await prisma.client.createMany({
    data: clients.map((c) => ({
      id: c.id,
      name: c.name,
      cuit: c.cuit,
      address: c.address,
      phone: c.phone,
      email: c.email,
      discountLevel: c.discountLevel,
      canEditPrices: c.canEditPrices,
      commissionFee: c.commissionFee,
      sellsOnInstallments: c.sellsOnInstallments,
    })),
    skipDuplicates: true,
  });

  // Products
  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        type: p.type,
        application: p.application,
        colors: p.colors,
        status: p.status as ProductStatus,
      },
    });
  }

  // Orders (incluye los que aparecen en OrderDetail y no existen en orders)
  await prisma.order.createMany({
    data: orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      clientId: o.clientId,
      clientName: o.clientName,
      status: mapOrderStatus(o.status),
      totalAmount: new Prisma.Decimal(o.totalAmount),
      orderDate: o.orderDate,
      isPartial: o.isPartial,
    })),
    skipDuplicates: true,
  });

  const knownOrderIds = new Set(orders.map((o) => o.id));
  const extraOrderIds = Array.from(new Set(orderDetails.map((d) => d.orderId))).filter((id) => !knownOrderIds.has(id));

  for (const orderId of extraOrderIds) {
    const details = orderDetails.filter((d) => d.orderId === orderId);
    if (details.length === 0) continue;
    const total = details.reduce((sum, d) => sum + d.totalPrice, 0);
    const clientId = details[0].clientId;
    const client = clients.find((c) => c.id === clientId);

    await prisma.order.create({
      data: {
        id: orderId,
        userId: null,
        clientId,
        clientName: client?.name ?? `Cliente ${clientId}`,
        status: OrderStatus.pending,
        totalAmount: new Prisma.Decimal(total),
        orderDate: details[0].productionDate ?? new Date(),
        isPartial: false,
      },
    });
  }

  // Production Batches
  await prisma.productionBatch.createMany({
    data: productionBatches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      productionDate: b.productionDate,
      plannedDate: b.plannedDate,
      expeditionDate: b.expeditionDate ?? null,
      sentToClientDate: b.sentToClientDate ?? null,
      qrCode: b.qrCode ?? null,
      status: mapBatchStatus(b.status),
    })),
    skipDuplicates: true,
  });

  // Order Details
  await prisma.orderDetail.createMany({
    data: orderDetails.map((d) => ({
      id: d.id,
      productId: d.productId,
      productName: d.productName,
      type: d.type,
      application: d.application,
      color: d.color,
      quantity: d.quantity,
      unitPrice: new Prisma.Decimal(d.unitPrice),
      totalPrice: new Prisma.Decimal(d.totalPrice),
      orderId: d.orderId,
      clientId: d.clientId,
      cartId: d.cartId ?? null,
      paymentId: d.paymentId ?? null,
      deliveryNoteId: d.deliveryNoteId ?? null,
      batchId: d.batchId ?? null,
      status: d.status as OrderDetailStatus,
      isProduced: d.isProduced,
      productionDate: d.productionDate ?? null,
      productionDoneDate: d.productionDoneDate ?? null,
      dispatchReadyDate: d.dispatchReadyDate ?? null,
      dispatchedDate: d.dispatchedDate ?? null,
      deliveryNoteDate: d.deliveryNoteDate ?? null,
    })),
    skipDuplicates: true,
  });

  // Claims
  await prisma.claim.createMany({
    data: claims.map((c) => ({
      id: c.id,
      orderDetailId: c.orderDetailId,
      orderId: c.orderId,
      clientId: c.clientId,
      clientName: c.clientName,
      reason: c.reason,
      status: c.status as ClaimStatus,
      resolution: c.resolution ?? null,
      createdAt: c.createdAt,
    })),
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    console.log('Seed completado');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });