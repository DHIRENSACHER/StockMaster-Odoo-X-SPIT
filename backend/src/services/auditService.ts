import { pool } from '../config/database';
import { AuthAuditLog } from '../types';

export const logAuthEvent = async (entry: AuthAuditLog) => {
  await pool.execute(
    `INSERT INTO auth_audit_log (user_email, firebase_uid, event, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      entry.userEmail,
      entry.firebaseUid ?? null,
      entry.event,
      entry.ipAddress ?? null,
      entry.userAgent ?? null,
    ]
  );
};
