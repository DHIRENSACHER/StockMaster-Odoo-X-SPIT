import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { User } from '../types';
import { logAuthEvent } from './auditService';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query(
    `SELECT id, email, password_hash AS passwordHash, full_name AS fullName, is_active AS isActive, firebase_uid AS firebaseUid
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

export const ensureUserFromFirebase = async (opts: {
  email: string;
  fullName?: string | null;
  firebaseUid?: string | null;
}): Promise<User> => {
  const existing = await findUserByEmail(opts.email);
  if (existing) {
    // Backfill firebase uid if missing
    if (!existing.firebaseUid && opts.firebaseUid) {
      await pool.execute(`UPDATE inventory_user SET firebase_uid = ? WHERE id = ?`, [
        opts.firebaseUid,
        existing.id,
      ]);
    }
    return existing;
  }

  const placeholderHash = await bcrypt.hash('!', 4);
  const fullName = opts.fullName || opts.email.split('@')[0] || 'Firebase User';

  const [insert] = await pool.execute(
    `INSERT INTO inventory_user (email, password_hash, full_name, is_active, firebase_uid)
     VALUES (?, ?, ?, 1, ?)`,
    [opts.email, placeholderHash, fullName, opts.firebaseUid ?? null]
  );
  const userId = (insert as any).insertId as number;

  // default role viewer
  const [roleRows] = await pool.query(`SELECT id FROM auth_group WHERE name = 'viewer' LIMIT 1`);
  const viewerId = (roleRows as any[])[0]?.id;
  if (viewerId) {
    await pool.execute(
      `INSERT IGNORE INTO inventory_user_groups (user_id, group_id) VALUES (?, ?)`,
      [userId, viewerId]
    );
  }

  const roles = await getUserRoles(userId);

  await logAuthEvent({
    userEmail: opts.email,
    firebaseUid: opts.firebaseUid ?? null,
    event: 'user_created',
  });

  return {
    id: userId,
    email: opts.email,
    passwordHash: placeholderHash,
    fullName,
    isActive: true,
    firebaseUid: opts.firebaseUid ?? undefined,
    roles,
  };
};
