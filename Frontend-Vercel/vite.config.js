import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl'; 
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        vue(),
        basicSsl() // Generates the self-signed TLS certificate for localhost
    ],
    server: {
        host: true, // Allows external IP access (like 10.0.2.15)
        port: 5173,
        https: true, // Forces HTTPS
        proxy: {
            '/api': {
                // Connect directly to the Artisan server running on the Windows host
                target: 'http://10.0.2.2:8000', 
                changeOrigin: true,
                secure: false // Ignores SSL validation for this internal proxy connection
            }
        }
    },
    test: {
        globals: true,
        // CRITICAL FIX: Changed from 'jsdom' to 'happy-dom' to avoid ESM require errors
        environment: 'happy-dom', 
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