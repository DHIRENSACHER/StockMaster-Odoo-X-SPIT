import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { User } from '../types';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query(
    `SELECT id, email, password_hash AS passwordHash, full_name AS fullName, is_active AS isActive
     FROM inventory_user WHERE email = ? LIMIT 1`,
    [email]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  const roles = await getUserRoles(row.id);
  return { ...row, roles };
};

export const getUserRoles = async (userId: number): Promise<string[]> => {
  const [rows] = await pool.query(
    `SELECT g.name as role
     FROM auth_group g
     INNER JOIN inventory_user_groups ug ON ug.group_id = g.id
     WHERE ug.user_id = ?`,
    [userId]
  );
  return (rows as any[]).map((r) => r.role);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
