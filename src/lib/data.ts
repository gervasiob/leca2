import type { Client, Order, OrderDetail, ProductionBatch, Product, Claim, User, Role } from './types';
import { UserRole } from './types';

export const clients: Client[] = [
  { id: 1, name: 'Constructora del Norte S.A.', cuit: '30-12345678-9', address: 'Av. Siempre Viva 742, Springfield', phone: '11-2345-6789', email: 'compras@constructora-norte.com', discountLevel: 2, canEditPrices: false, commissionFee: 5, sellsOnInstallments: true },
  { id: 2, name: 'Diseño & Deco Interior', cuit: '30-87654321-5', address: 'Calle Falsa 123, Villa Chica', phone: '11-8765-4321', email: 'info@diseno-deco.com', discountLevel: 1, canEditPrices: true, commissionFee: 10, sellsOnInstallments: false },
  { id: 3, name: 'Pinturas Express', cuit: '30-11223344-7', address: 'Boulevard de los Sueños Rotos 456, Metrópolis', phone: '11-1122-3344', email: 'pedidos@pinturasexpress.com', discountLevel: 3, canEditPrices: false, commissionFee: 3, sellsOnInstallments: true },
  { id: 4, name: 'Hogar Total S.R.L.', cuit: '30-55667788-2', address: 'Pasaje Mágico 789, Ciudad Gótica', phone: '11-5566-7788', email: 'proveedores@hogartotal.com', discountLevel: 1, canEditPrices: false, commissionFee: 5, sellsOnInstallments: false },
];

export const products: Product[] = [
    { id: 1, name: 'Pintura Látex Interior Mate 20L', type: 'Pintura', application: 'Rodillo', colors: ['Blanco', 'Gris Perla', 'Marfil', 'Azul Profundo'], status: 'active' },
    { id: 2, name: 'Esmalte Sintético Brillante 4L', type: 'Esmalte', application: 'Pincel', colors: ['Blanco', 'Negro', 'Rojo', 'Azul Marino'], status: 'active' },
    { id: 3, name: 'Impermeabilizante Techos 10L', type: 'Impermeabilizante', application: 'Rodillo', colors: ['Rojo', 'Verde', 'Blanco', 'Gris'], status: 'active' },
    { id: 4, name: 'Barniz Marino Exterior 1L', type: 'Barniz', application: 'Pincel', colors: ['Transparente', 'Caoba', 'Roble', 'Nogal'], status: 'active' },
    { id: 5, name: 'Pintura Epoxi Pisos Alto Tránsito 4L', type: 'Epoxi', application: 'Rodillo', colors: ['Gris Cemento', 'Azul', 'Verde Esmeralda', 'Beige'], status: 'active' },
    { id: 6, name: 'Texturado Fino', type: 'Texturado', application: 'Llana', colors: ['Arena', 'Piedra', 'Blanco Tiza', 'Gris Urbano'], status: 'active' },
    { id: 7, name: 'Texturado Mediano', type: 'Texturado', application: 'Llana', colors: ['Gris Cemento', 'Terracota', 'Natural', 'Beige Almendra'], status: 'active' },
];

export const orders: Order[] = [
  { id: 101, userId: 2, clientName: 'Constructora del Norte S.A.', clientId: 1, status: 'partial', totalAmount: 150500, orderDate: new Date('2023-10-15'), isPartial: true },
  { id: 102, userId: 2, clientName: 'Diseño & Deco Interior', clientId: 2, status: 'complete', totalAmount: 78000, orderDate: new Date('2023-10-18'), isPartial: false },
  { id: 103, userId: 2, clientName: 'Constructora del Norte S.A.', clientId: 1, status: 'pending', totalAmount: 300000, orderDate: new Date('2023-11-02'), isPartial: false },
  { id: 104, userId: 3, clientName: 'Pinturas Express', clientId: 3, status: 'in-production', totalAmount: 12500, orderDate: new Date('2023-11-05'), isPartial: false },
];

export const orderDetails: OrderDetail[] = [
  // Order 101
  { id: 1, productId: 1, productName: 'Pintura Látex Interior Mate 20L', type: 'Pintura', application: 'Rodillo', color: 'Blanco', quantity: 10, unitPrice: 12000, totalPrice: 120000, orderId: 101, clientId: 1, status: 'delivered', isProduced: true, productionDate: new Date('2023-10-20'), batchId: 1, productionDoneDate: new Date('2023-10-21'), dispatchedDate: new Date('2023-10-22'), deliveryNoteDate: new Date('2023-10-23') },
  { id: 2, productId: 2, productName: 'Esmalte Sintético Brillante 4L', type: 'Esmalte', application: 'Pincel', color: 'Blanco', quantity: 5, unitPrice: 6100, totalPrice: 30500, orderId: 101, clientId: 1, status: 'dispatched', isProduced: true, productionDate: new Date('2023-10-21'), batchId: 1, productionDoneDate: new Date('2023-10-22'), dispatchedDate: new Date('2023-10-23'), deliveryNoteDate: new Date('2023-10-23') },
  // Order 102
  { id: 3, productId: 4, productName: 'Barniz Marino Exterior 1L', type: 'Barniz', application: 'Pincel', color: 'Transparente', quantity: 20, unitPrice: 3900, totalPrice: 78000, orderId: 102, clientId: 2, status: 'delivered', isProduced: true, productionDate: new Date('2023-10-25'), batchId: 2, productionDoneDate: new Date('2023-10-26'), dispatchedDate: new Date('2023-10-27'), deliveryNoteDate: new Date('2023-10-28') },
  // Order 103
  { id: 4, productId: 5, productName: 'Pintura Epoxi Pisos Alto Tránsito 4L', type: 'Epoxi', application: 'Rodillo', color: 'Gris Cemento', quantity: 15, unitPrice: 16000, totalPrice: 240000, orderId: 103, clientId: 1, status: 'produced', isProduced: true, productionDate: new Date('2023-11-08'), batchId: 3, productionDoneDate: new Date('2023-11-09'), dispatchedDate: undefined, deliveryNoteDate: undefined },
  { id: 6, productId: 1, productName: 'Pintura Látex Interior Mate 20L', type: 'Pintura', application: 'Rodillo', color: 'Azul Profundo', quantity: 5, unitPrice: 12000, totalPrice: 60000, orderId: 103, clientId: 1, status: 'claimed', isProduced: true, productionDate: new Date('2023-11-10'), batchId: 3, productionDoneDate: new Date('2023-11-11'), dispatchedDate: new Date('2023-11-12'), deliveryNoteDate: new Date('2023-11-13') },
  // Order 104
  { id: 5, productId: 3, productName: 'Impermeabilizante Techos 10L', type: 'Impermeabilizante', application: 'Rodillo', color: 'Rojo', quantity: 1, unitPrice: 12500, totalPrice: 12500, orderId: 104, clientId: 3, status: 'pending', isProduced: false, productionDate: new Date('2023-11-25'), batchId: undefined, productionDoneDate: undefined, dispatchedDate: undefined, deliveryNoteDate: undefined },
  // New pending orders for production planning
  { id: 7, productId: 6, productName: 'Texturado Fino', type: 'Texturado', application: 'Llana', color: 'Arena', quantity: 8, unitPrice: 9500, totalPrice: 76000, orderId: 105, clientId: 4, status: 'pending', isProduced: false, productionDate: new Date('2023-11-26') },
  { id: 8, productId: 6, productName: 'Texturado Fino', type: 'Texturado', application: 'Llana', color: 'Piedra', quantity: 12, unitPrice: 9500, totalPrice: 114000, orderId: 106, clientId: 1, status: 'pending', isProduced: false, productionDate: new Date('2023-11-27') },
  { id: 9, productId: 7, productName: 'Texturado Mediano', type: 'Texturado', application: 'Llana', color: 'Gris Cemento', quantity: 20, unitPrice: 11000, totalPrice: 220000, orderId: 107, clientId: 2, status: 'pending', isProduced: false, productionDate: new Date('2023-11-28') },
];

export const productionBatches: ProductionBatch[] = [
    { id: 1, batchNumber: 'L231020', productionDate: new Date('2023-10-20'), plannedDate: new Date('2023-10-19'), items: [orderDetails[0], orderDetails[1]], status: 'Completed' },
    { id: 2, batchNumber: 'L231025', productionDate: new Date('2023-10-25'), plannedDate: new Date('2023-10-24'), items: [orderDetails[2]], status: 'Completed' },
    { id: 3, batchNumber: 'L231108', productionDate: new Date('2023-11-08'), plannedDate: new Date('2023-11-07'), items: [orderDetails[3], orderDetails[4]], status: 'In Progress' },
    { id: 4, batchNumber: 'L231122', productionDate: new Date('2023-11-22'), plannedDate: new Date('2023-11-21'), items: [], status: 'Planned' },
];

export const claims: Claim[] = [
    { id: 1, orderDetailId: 6, orderId: 103, clientId: 1, clientName: 'Constructora del Norte S.A.', reason: 'Color incorrecto', status: 'open', resolution: undefined, createdAt: new Date('2023-11-15') },
];

export const users: Pick<User, 'id' | 'name' | 'email' | 'role' | 'lastLogin'>[] = [
    { id: 1, name: 'admin', email: 'admin@fabrica.com', role: UserRole.Admin, lastLogin: new Date('2023-11-20T10:00:00Z') },
    { id: 2, name: 'vendedor_estrella', email: 'ventas@fabrica.com', role: UserRole.Sales, lastLogin: new Date('2023-11-19T14:30:00Z') },
    { id: 3, name: 'jefe_produccion', email: 'produccion@fabrica.com', role: UserRole.Production, lastLogin: new Date('2023-11-21T08:00:00Z') },
    { id: 4, name: 'system', email: 'system@fabrica.com', role: UserRole.System, lastLogin: new Date() },
    { id: 5, name: 'invitado', email: 'guest@fabrica.com', role: UserRole.Guest, lastLogin: new Date() },
];

export const screens = [
    'Tablero',
    'Cuentas por Cobrar',
    'Ventas',
    'Producción',
    'Remitos',
    'Listas de Precios',
    'Reclamos',
    'Configuración',
    'Reportes',
    'DB Viewer',
];

export const roles: Role[] = [
    { id: 1, name: 'Admin', permissions: [...screens.filter(s => s !== 'DB Viewer')] },
    { id: 2, name: 'Ventas', permissions: ['Cuentas por Cobrar', 'Ventas', 'Remitos', 'Listas de Precios', 'Reclamos'] },
    { id: 3, name: 'Producción', permissions: ['Produccion', 'Remitos'] },
    { id: 4, name: 'Invitado', permissions: [] },
    { id: 5, name: 'System', permissions: [...screens] },
];
