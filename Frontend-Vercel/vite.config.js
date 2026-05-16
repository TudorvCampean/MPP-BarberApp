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
    },
    // ADAUGĂ ACEASTĂ SECȚIUNE
    test: {
        globals: true,
        environment: 'jsdom', // Rezolvă eroarea de localStorage
        exclude: [
            '**/node_modules/**',
            '**/tests/e2e/**', // Exclude testele Playwright din Vitest
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
        postcss: __dirname,
    },
});
