import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, requests to /api are passed on to the Express server,
// so the browser sees one address and CORS is not a problem.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
