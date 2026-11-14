import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/profile': 'http://127.0.0.1:8000',
      '/roles': 'http://127.0.0.1:8000',
      '/goal': 'http://127.0.0.1:8000',
      '/analysis': 'http://127.0.0.1:8000',
      '/roadmap': 'http://127.0.0.1:8000',
      '/assessments': 'http://127.0.0.1:8000',
      '/progress': 'http://127.0.0.1:8000',
      '/mentor': 'http://127.0.0.1:8000',
      '/agents': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
      '/simulate': 'http://127.0.0.1:8000'
    }
  }
});

