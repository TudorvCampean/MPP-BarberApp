import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl'; // Importă plugin-ul
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        vue(),
        basicSsl() // Generează automat certificatul TLS pentru localhost
    ],
    server: {
        host: true, // Permite accesul de pe IP-uri externe (ca 10.0.2.15)
        port: 5173,
        https: true, // Activează protocolul securizat
        proxy: {
            '/api': {
                // Ne conectăm simplu și direct la portul deschis de Artisan
                target: 'http://10.0.2.2:8000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/dist/**'],
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        postcss: path.resolve(__dirname),
    },
});
