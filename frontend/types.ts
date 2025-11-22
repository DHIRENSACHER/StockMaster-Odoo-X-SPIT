
export enum ViewState {
  LANDING,
  AUTH,
  DASHBOARD,
  PRODUCTS,
  OPERATIONS_RECEIPTS,
  OPERATIONS_DELIVERIES,
  OPERATIONS_INTERNAL,
  OPERATIONS_ADJUSTMENTS,
  STOCK_LEDGER,
  FORECASTING,
  HEATMAP,
  TIMELINE,
  SETTINGS,
  PROFILE,
  QUANTUM_INVENTORY
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string; // Unit of Measure
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  location: string;
  barcode?: string;
  qcStatus?: 'PASS' | 'FAIL' | 'PENDING';
}

export interface OperationItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Operation {
  id: string;
  type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
  reference: string;
  contact: string; // Supplier (Receipt) or Customer (Delivery)
  responsible: string;
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED';
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
  id: string;
  date: string;
  reference: string;
  productName: string;
  sku: string;
  location: string;
  credit: number; // Out
  debit: number; // In
  balance: number;
  user: string;
  type: 'IN' | 'OUT' | 'ADJ' | 'MOVE';
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  capacityPct: number;
}

export interface ForecastMetric {
  month: string;
  actualDemand: number;
  predictedDemand: number;
  stockLevel: number;
}

export interface HeatmapNode {
  id: string;
  rack: string;
  velocity: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEAD';
  occupancy: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  document: string;
  timestamp: string;
  type: 'VALIDATE' | 'CREATE' | 'EDIT' | 'DELETE';
}
