export type OperationType = 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
export type OperationStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED';

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  uom: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  location: string;
  barcode?: string;
  qcStatus?: 'PASS' | 'FAIL' | 'PENDING';
}

export interface OperationItem {
  productId: number;
  productName: string;
  quantity: number;
}

export interface Operation {
  id: number;
  type: OperationType;
  reference: string;
  contact: string;
  responsible: string;
  status: OperationStatus;
  sourceLocation?: string;
  destLocation?: string;
  scheduledDate: string;
  items: OperationItem[];
  notes?: string;
  version?: number;
  createdAt?: string;
  lastEditedBy?: string;
}

export interface StockLedgerEntry {
  id: number;
  date: string;
  reference: string;
  productName: string;
  sku: string;
  location: string;
  credit: number;
  debit: number;
  balance: number;
  user: string;
  type: 'IN' | 'OUT' | 'ADJ' | 'MOVE';
}

export interface Warehouse {
  id: number;
  name: string;
  shortCode: string;
  address: string;
  capacityPct?: number;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  firebaseUid?: string;
  isActive: boolean;
  roles: string[];
}

export interface AuthAuditLog {
  id?: number;
  userEmail: string;
  firebaseUid?: string | null;
  event: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
}
