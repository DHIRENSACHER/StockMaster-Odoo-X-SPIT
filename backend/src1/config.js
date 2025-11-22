// ============================================
// 📁 FILE: src/config.js
// ============================================
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyDHNB6LlRsLVmmv9yPR1LSzWjd6BvI43lA',
    model: 'gemini-2.5-flash'  // User's model
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  server: {
    port: parseInt(process.env.PORT) || 5000
  }
};
