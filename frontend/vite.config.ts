import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/forecast': {
            target: 'http://127.0.0.1:5000',
            changeOrigin: true,
            // keep the incoming path (no rewrite needed) or normalize the path safely
            rewrite: (p) => p.replace(/^\/api\/forecast/, '/api/forecast')
          },
          '/dashboard': {
            target: 'http://127.0.0.1:5000',
            changeOrigin: true
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
