import type { Client, Order, OrderDetail, ProductionBatch, Product, Claim } from './types';

export const clients: Client[] = [
  { id: 1, name: 'Constructora del Norte S.A.', cuit: '30-12345678-9', address: 'Av. Siempre Viva 742', phone: '11-2345-6789', email: 'compras@constructora-norte.com', discountLevel: 2, canEditPrices: false, commissionFee: 5, sellsOnInstallments: true },
  { id: 2, name: 'Diseño & Deco Interior', cuit: '30-87654321-5', address: 'Calle Falsa 123', phone: '11-8765-4321', email: 'info@diseno-deco.com', discountLevel: 1, canEditPrices: true, commissionFee: 10, sellsOnInstallments: false },
  { id: 3, name: 'Pinturas Express', cuit: '30-11223344-7', address: 'Boulevard de los Sueños Rotos 456', phone: '11-1122-3344', email: 'pedidos@pinturasexpress.com', discountLevel: 3, canEditPrices: false, commissionFee: 3, sellsOnInstallments: true },
  { id: 4, name: 'Hogar Total S.R.L.', cuit: '30-55667788-2', address: 'Pasaje Mágico 789', phone: '11-5566-7788', email: 'proveedores@hogartotal.com', discountLevel: 1, canEditPrices: false, commissionFee: 5, sellsOnInstallments: false },
];

export const products: Product[] = [
    { id: 1, name: 'Pintura Látex Interior Mate 20L', category: 'Látex' },
    { id: 2, name: 'Esmalte Sintético Brillante Blanco 4L', category: 'Esmalte' },
    { id: 3, name: 'Impermeabilizante Techos Rojo 10L', category: 'Impermeabilizante' },
    { id: 4, name: 'Barniz Marino Exterior 1L', category: 'Barniz' },
    { id: 5, name: 'Pintura Epoxi Pisos Alto Tránsito Gris 4L', category: 'Epoxi' },
];

export const orders: Order[] = [
  { id: 101, userId: 1, clientName: 'Constructora del Norte S.A.', clientId: 1, status: 'partial', totalAmount: 150500, orderDate: new Date('2023-10-15'), isPartial: true },
  { id: 102, userId: 2, clientName: 'Diseño & Deco Interior', clientId: 2, status: 'complete', totalAmount: 78000, orderDate: new Date('2023-10-18'), isPartial: false },
  { id: 103, userId: 1, clientName: 'Constructora del Norte S.A.', clientId: 1, status: 'pending', totalAmount: 240000, orderDate: new Date('2023-11-02'), isPartial: false },
  { id: 104, userId: 3, clientName: 'Pinturas Express', clientId: 3, status: 'in-production', totalAmount: 12500, orderDate: new Date('2023-11-05'), isPartial: false },
];

export const orderDetails: OrderDetail[] = [
  // Order 101
  { id: 1, productId: 1, productName: 'Pintura Látex Interior Mate 20L', orderId: 101, clientId: 1, texture: 'Liso', application: 'Rodillo', quantity: 10, unitPrice: 12000, totalPrice: 120000, status: 'delivered', isProduced: true, productionDate: new Date('2023-10-20'), batchId: 1, productionDoneDate: new Date('2023-10-21'), dispatchedDate: new Date('2023-10-22'), deliveryNoteDate: new Date('2023-10-23') },
  { id: 2, productId: 2, productName: 'Esmalte Sintético Brillante Blanco 4L', orderId: 101, clientId: 1, texture: 'Brillante', application: 'Pincel', quantity: 5, unitPrice: 6100, totalPrice: 30500, status: 'dispatched', isProduced: true, productionDate: new Date('2023-10-21'), batchId: 1, productionDoneDate: new Date('2023-10-22'), dispatchedDate: new Date('2023-10-23'), deliveryNoteDate: new Date('2023-10-23') },
  // Order 102
  { id: 3, productId: 4, productName: 'Barniz Marino Exterior 1L', orderId: 102, clientId: 2, texture: 'Transparente', application: 'Pincel', quantity: 20, unitPrice: 3900, totalPrice: 78000, status: 'delivered', isProduced: true, productionDate: new Date('2023-10-25'), batchId: 2, productionDoneDate: new Date('2023-10-26'), dispatchedDate: new Date('2023-10-27'), deliveryNoteDate: new Date('2023-10-28') },
  // Order 103
  { id: 4, productId: 5, productName: 'Pintura Epoxi Pisos Alto Tránsito Gris 4L', orderId: 103, clientId: 1, texture: 'Liso', application: 'Rodillo', quantity: 15, unitPrice: 16000, totalPrice: 240000, status: 'produced', isProduced: true, productionDate: new Date('2023-11-08'), batchId: 3, productionDoneDate: new Date('2023-11-09'), dispatchedDate: undefined, deliveryNoteDate: undefined },
  // Order 104
  { id: 5, productId: 3, productName: 'Impermeabilizante Techos Rojo 10L', orderId: 104, clientId: 3, texture: 'Elastomérico', application: 'Rodillo', quantity: 1, unitPrice: 12500, totalPrice: 12500, status: 'pending', isProduced: false, productionDate: undefined, batchId: undefined, productionDoneDate: undefined, dispatchedDate: undefined, deliveryNoteDate: undefined },
  { id: 6, productId: 1, productName: 'Pintura Látex Interior Mate 20L', orderId: 103, clientId: 1, texture: 'Liso', application: 'Rodillo', quantity: 5, unitPrice: 12000, totalPrice: 60000, status: 'claimed', isProduced: true, productionDate: new Date('2023-11-10'), batchId: 3, productionDoneDate: new Date('2023-11-11'), dispatchedDate: new Date('2023-11-12'), deliveryNoteDate: new Date('2023-11-13') },
];

export const productionBatches: ProductionBatch[] = [
    { id: 1, batchNumber: '2329301', productionDate: new Date('2023-10-20'), plannedDate: new Date('2023-10-19'), items: [orderDetails[0], orderDetails[1]], status: 'Completed' },
    { id: 2, batchNumber: '2329801', productionDate: new Date('2023-10-25'), plannedDate: new Date('2023-10-24'), items: [orderDetails[2]], status: 'Completed' },
    { id: 3, batchNumber: '2331201', productionDate: new Date('2023-11-08'), plannedDate: new Date('2023-11-07'), items: [orderDetails[3], orderDetails[5]], status: 'In Progress' },
    { id: 4, batchNumber: '2331501', productionDate: new Date(), plannedDate: new Date(), items: [], status: 'Planned' },
];

export const claims: Claim[] = [
    { id: 1, orderDetailId: 6, orderId: 103, clientId: 1, clientName: 'Constructora del Norte S.A.', reason: 'Color incorrecto', status: 'open', resolution: undefined, createdAt: new Date('2023-11-15') },
];
