import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [vue()],
    server: {
        host: true,
        port: 5173,
        https: true, // Activează HTTPS pentru frontend
        proxy: {
            '/api': {
                target: 'https://mpp-barberapp.test', // URL-ul securizat de Herd
                changeOrigin: true,
                secure: false // Permite certificatele auto-semnate generate de Herd
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom', // Necesar pentru a simula browserul (localStorage, DOM)
        exclude: [
            '**/node_modules/**',
            '**/tests/e2e/**', // Exclude testele Playwright pentru a nu rula în Vitest
            '**/dist/**'
        ],
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        // Asigură-te că fișierul postcss.config.js este în rădăcina proiectului
        postcss: __dirname,
    },
});
