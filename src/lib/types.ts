export type OrderDetailStatus = 'pending' | 'produced' | 'dispatched' | 'delivered' | 'claimed' | 'resolved' | 'cancelled';

export interface Product {
    id: number;
    name: string;
    type: string;
    application: string;
    color: string;
}

export interface OrderDetail {
  id: number;
  productId: number;
  productName: string;
  type: string;
  application: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderId: number;
  clientId: number;
  cartId?: string;
  paymentId?: number;
  deliveryNoteId?: number;
  batchId?: number;
  status: OrderDetailStatus;
  // Production fields
  isProduced: boolean;
  productionDate?: Date;
  productionDoneDate?: Date;
  dispatchReadyDate?: Date;
  dispatchedDate?: Date;
  deliveryNoteDate?: Date;
}

export interface Order {
  id: number;
  userId: number;
  clientName: string;
  clientId: number;
  status: string;
  totalAmount: number;
  orderDate: Date;
  isPartial: boolean;
}

export interface Client {
  id: number;
  name: string;
  cuit: string;
  address: string;
  phone: string;
  email: string;
  discountLevel: number;
  canEditPrices: boolean;
  commissionFee: number;
  sellsOnInstallments: boolean;
}

export interface ProductionBatch {
  id: number;
  batchNumber: string; // Julian system
  productionDate: Date;
  plannedDate: Date;
  expeditionDate?: Date;
  sentToClientDate?: Date;
  items: OrderDetail[];
  qrCode?: string;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface Claim {
    id: number;
    orderDetailId: number;
    orderId: number;
    clientId: number;
    clientName: string;
    reason: string;
    status: 'open' | 'resolved' | 'closed';
    resolution?: string;
    createdAt: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Sales' | 'Production';
  lastLogin: Date;
}
