import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config with React and fixed dev port (3000 to match backend CORS default)
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
});
