import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

import axios from 'axios';
// API calls use relative URLs — Vercel proxies /api/* to the backend.
// Update the BACKEND_URL in the Vercel dashboard when herd share restarts.
// No cross-origin requests are made so CORS is not required.
axios.defaults.baseURL = '';
if (typeof window !== 'undefined') {
	window.__API_BASE__ = '';
}
createApp(MainApp).mount('#app');

