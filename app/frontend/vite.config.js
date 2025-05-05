import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });; // Adjust based on relative depth

export default defineConfig({
  plugins: [react()],  server: {
    port: parseInt(process.env.FE_PORT),
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.BE_PORT || 3000}`,
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      }
    }
  }
})