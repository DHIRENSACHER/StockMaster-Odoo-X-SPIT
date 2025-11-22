import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const runSqlFile = async (file: string) => {
  const sql = fs.readFileSync(path.join(__dirname, '../../sql', file), 'utf8');
  const statements = sql
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const main = async () => {
  logger.info('Applying schema...');
  await runSqlFile('schema.sql');
  logger.info('Seeding data...');
  await runSqlFile('seed.sql');
  logger.info('Seed completed');
  await pool.end();
};

main().catch((err) => {
  logger.error(err, 'Seed failed');
  process.exit(1);
});
