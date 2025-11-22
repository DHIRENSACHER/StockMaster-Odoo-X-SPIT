import { pool } from '../config/database';
import { Warehouse } from '../types';

export interface Location {
  id: number;
  code: string;
  name: string;
  warehouseId: number;
}

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const [rows] = await pool.query(
    `SELECT id, name, code AS shortCode, address, capacity_pct AS capacityPct 
     FROM inventory_warehouse ORDER BY id`
  );
  return (rows as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    shortCode: row.shortCode,
    address: row.address,
    capacityPct: Number(row.capacityPct ?? 0),
  }));
};

export const getLocations = async (): Promise<Location[]> => {
  const [rows] = await pool.query(
    `SELECT id, code, name, warehouse_id AS warehouseId FROM inventory_location ORDER BY id`
  );
  return rows as Location[];
};
