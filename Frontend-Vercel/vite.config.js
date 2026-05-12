import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [vue()],

  // -------------------------------------------------------------------------
  // LAN Dev Server — Assignment 3 Client/Server Setup
  // -------------------------------------------------------------------------
  // `host: true` binds Vite to 0.0.0.0 so it is reachable from the Host OS
  // (and any other machine on the same LAN) — not just the VM's own loopback.
  // Access the app from the Host browser at:  http://<VM-IP>:5173
  // -------------------------------------------------------------------------
  server: {
    host: true,   // equivalent to --host 0.0.0.0
    port: 5173,
  },

  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  css: {
    postcss: __dirname,
  },
});
