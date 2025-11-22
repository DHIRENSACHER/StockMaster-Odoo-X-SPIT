import { Product, Operation, Warehouse, StockLedgerEntry, ForecastMetric, HeatmapNode, ActivityLog } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Steel Rods 20mm', sku: 'ST-20', category: 'Raw Material', uom: 'kg', quantity: 120, minStock: 50, maxStock: 500, price: 45.00, location: 'WH-Main', qcStatus: 'PASS' },
  { id: 'p2', name: 'Copper Wire', sku: 'CU-W1', category: 'Raw Material', uom: 'm', quantity: 40, minStock: 100, maxStock: 300, price: 12.50, location: 'WH-Main', qcStatus: 'PENDING' },
  { id: 'p3', name: 'Office Chair Ergonomic', sku: 'FURN-01', category: 'Finished Goods', uom: 'unit', quantity: 15, minStock: 10, maxStock: 50, price: 150.00, location: 'WH-Dispatch', qcStatus: 'PASS' },
  { id: 'p4', name: 'Gaming Desk', sku: 'FURN-02', category: 'Finished Goods', uom: 'unit', quantity: 8, minStock: 5, maxStock: 30, price: 220.00, location: 'WH-Dispatch', qcStatus: 'PASS' },
  { id: 'p5', name: 'LED Monitor 27"', sku: 'ELEC-01', category: 'Electronics', uom: 'unit', quantity: 200, minStock: 20, maxStock: 150, price: 300.00, location: 'WH-Main', qcStatus: 'PASS' },
];

export const MOCK_OPERATIONS: Operation[] = [
  {
    id: 'op1',
    type: 'RECEIPT',
    reference: 'WH/IN/0001',
    contact: 'Acme Steel Co.',
    responsible: 'Admin',
    status: 'DONE',
    sourceLocation: 'Vendor',
    destLocation: 'WH-Main',
    scheduledDate: '2023-10-25',
    items: [{ productId: 'p1', productName: 'Steel Rods 20mm', quantity: 100 }],
    version: 1,
    lastEditedBy: 'Admin'
  },
  {
    id: 'op2',
    type: 'DELIVERY',
    reference: 'WH/OUT/0001',
    contact: 'TechStart Inc.',
    responsible: 'Manager',
    status: 'READY',
    sourceLocation: 'WH-Dispatch',
    destLocation: 'Customer',
    scheduledDate: '2023-10-27',
    items: [{ productId: 'p3', productName: 'Office Chair Ergonomic', quantity: 5 }],
    version: 2,
    lastEditedBy: 'Manager'
  },
  {
    id: 'op3',
    type: 'INTERNAL',
    reference: 'WH/INT/0002',
    contact: 'Internal',
    responsible: 'Staff',
    status: 'DRAFT',
    sourceLocation: 'WH-Main',
    destLocation: 'WH-Dispatch',
    scheduledDate: '2023-10-28',
    items: [{ productId: 'p4', productName: 'Gaming Desk', quantity: 2 }],
    version: 1,
    lastEditedBy: 'Staff'
  },
  {
    id: 'op4',
    type: 'RECEIPT',
    reference: 'WH/IN/0003',
    contact: 'Global Electronics',
    responsible: 'Admin',
    status: 'WAITING',
    sourceLocation: 'Vendor',
    destLocation: 'WH-Main',
    scheduledDate: '2023-11-01',
    items: [{ productId: 'p5', productName: 'LED Monitor 27"', quantity: 50 }],
    version: 1,
    lastEditedBy: 'Admin'
  }
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', shortCode: 'WH-Main', address: '123 Ind. Estate', capacityPct: 85 },
  { id: 'w2', name: 'Dispatch Center', shortCode: 'WH-Dispatch', address: '456 Logistics Blvd', capacityPct: 42 },
];

export const MOCK_LEDGER: StockLedgerEntry[] = [
  { id: 'l1', date: '2023-10-25 14:30', reference: 'WH/IN/0001', productName: 'Steel Rods 20mm', sku: 'ST-20', location: 'WH-Main', debit: 100, credit: 0, balance: 120, user: 'Admin', type: 'IN' },
  { id: 'l2', date: '2023-10-26 09:15', reference: 'WH/OUT/0001', productName: 'Office Chair', sku: 'FURN-01', location: 'WH-Dispatch', debit: 0, credit: 5, balance: 15, user: 'Manager', type: 'OUT' },
  { id: 'l3', date: '2023-10-26 11:00', reference: 'WH/INT/0002', productName: 'Gaming Desk', sku: 'FURN-02', location: 'WH-Main', debit: 0, credit: 2, balance: 8, user: 'Staff', type: 'MOVE' },
  { id: 'l4', date: '2023-10-27 16:45', reference: 'INV/ADJ/005', productName: 'Copper Wire', sku: 'CU-W1', location: 'WH-Main', debit: 0, credit: 5, balance: 40, user: 'Admin', type: 'ADJ' },
];

export const MOCK_FORECAST: ForecastMetric[] = [
  { month: 'Jan', actualDemand: 400, predictedDemand: 410, stockLevel: 500 },
  { month: 'Feb', actualDemand: 300, predictedDemand: 320, stockLevel: 450 },
  { month: 'Mar', actualDemand: 550, predictedDemand: 500, stockLevel: 300 },
  { month: 'Apr', actualDemand: 600, predictedDemand: 650, stockLevel: 200 },
  { month: 'May', actualDemand: 450, predictedDemand: 480, stockLevel: 350 },
  { month: 'Jun', actualDemand: 0, predictedDemand: 520, stockLevel: 400 },
];

export const MOCK_HEATMAP: HeatmapNode[] = [
  { id: 'r1', rack: 'A-01', velocity: 'HIGH', occupancy: 90 },
  { id: 'r2', rack: 'A-02', velocity: 'HIGH', occupancy: 85 },
  { id: 'r3', rack: 'A-03', velocity: 'MEDIUM', occupancy: 60 },
  { id: 'r4', rack: 'A-04', velocity: 'LOW', occupancy: 30 },
  { id: 'r5', rack: 'B-01', velocity: 'HIGH', occupancy: 95 },
  { id: 'r6', rack: 'B-02', velocity: 'DEAD', occupancy: 100 },
  { id: 'r7', rack: 'B-03', velocity: 'MEDIUM', occupancy: 45 },
  { id: 'r8', rack: 'B-04', velocity: 'LOW', occupancy: 20 },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  { id: 'a1', user: 'John Doe', action: 'Validated Receipt', document: 'WH/IN/0003', timestamp: '10 mins ago', type: 'VALIDATE' },
  { id: 'a2', user: 'Jane Smith', action: 'Created Delivery', document: 'WH/OUT/0005', timestamp: '1 hour ago', type: 'CREATE' },
  { id: 'a3', user: 'System', action: 'Auto-Replenishment Alert', document: 'Copper Wire', timestamp: '2 hours ago', type: 'CREATE' },
  { id: 'a4', user: 'John Doe', action: 'Stock Adjustment', document: 'INV/ADJ/09', timestamp: '5 hours ago', type: 'EDIT' },
];