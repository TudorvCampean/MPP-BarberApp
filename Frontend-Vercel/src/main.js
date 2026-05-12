import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

import axios from 'axios';

// ---------------------------------------------------------------------------
// API Base URL — LAN / Client-Server Setup (Assignment 3)
// ---------------------------------------------------------------------------
// Set VITE_API_BASE_URL in Frontend-Vercel/.env.local on the VM, e.g.:
//   VITE_API_BASE_URL=http://192.168.1.10:8000
//
// Falls back to localhost so pure-local dev still works without any .env file.
// ---------------------------------------------------------------------------
const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

axios.defaults.baseURL = apiBase;
if (typeof window !== 'undefined') {
    window.__API_BASE__ = apiBase;
}

createApp(MainApp).mount('#app');


