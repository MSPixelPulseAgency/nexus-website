import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// The /api/brand/* endpoints are PHP (see public/api/brand/). During `vite dev` they are
// proxied to a local PHP server started with scripts/local-php-server.php (port 8787).
export default defineConfig({ plugins: [react()], server: { proxy: { '/api/brand': 'http://127.0.0.1:8787' } } })
