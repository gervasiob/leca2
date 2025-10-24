
// Enumeración para roles de usuario, para consistencia.
export enum UserRole {
  Admin = 'Admin',
  Sales = 'Sales',
  Production = 'Production',
  Invitado = 'Invitado',
}

export type OrderDetailStatus = 'pending' | 'produced' | 'dispatched' | 'delivered' | 'claimed' | 'resolved' | 'cancelled';

export interface Product {
    id: string; // Firestore usa strings para los IDs
    name: string;
    type: string;
    application: string;
    colors: string[];
    status: 'active' | 'inactive';
}

export interface OrderDetail {
  id: string; // Firestore usa strings para los IDs
  productId: string;
  productName: string;
  type: string;
  application: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderId: string;
  clientId: string;
  cartId?: string;
  paymentId?: string;
  deliveryNoteId?: string;
  batchId?: string;
  status: OrderDetailStatus;
  // Production fields
  isProduced: boolean;
  productionDate?: Date; // O usa Timestamp de Firestore
  productionDoneDate?: Date;
  dispatchReadyDate?: Date;
  dispatchedDate?: Date;
  deliveryNoteDate?: Date;
}

export interface Order {
  id: string; // Firestore usa strings para los IDs
  userId: string;
  clientName: string;
  clientId: string;
  status: string;
  totalAmount: number;
  orderDate: Date; // O usa Timestamp de Firestore
  isPartial: boolean;
}

export interface Client {
  id: string; // Firestore usa strings para los IDs
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
  id: string; // Firestore usa strings para los IDs
  batchNumber: string;
  productionDate: Date;
  plannedDate: Date;
  expeditionDate?: Date;
  sentToClientDate?: Date;
  items: OrderDetail[]; // Puede ser una subcolección o un array de IDs
  qrCode?: string;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface Claim {
    id: string; // Firestore usa strings para los IDs
    orderDetailId: string;
    orderId: string;
    clientId: string;
    clientName: string;
    reason: string;
    status: 'open' | 'resolved' | 'closed';
    resolution?: string;
    createdAt: Date;
}

export interface User {
  id: string; // Firestore usa strings para los IDs
  name: string;
  email: string;
  role: UserRole;
  lastLogin: Date; // O usa Timestamp de Firestore
  passwordHash?: string; // El hash se almacena pero no se suele enviar al cliente
  roleId?: number; // Hacemos roleId opcional
}

export interface Role {
  id: number; // Mantenemos number aquí para consistencia con los datos originales, pero podría ser string
  name: string;
  permissions: string[];
}
