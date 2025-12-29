import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true, // Automatically open browser
    // API calls go directly to deployed API (configured in src/api.ts)
  }
});


