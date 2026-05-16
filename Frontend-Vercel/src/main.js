import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

import axios from 'axios';

// ---------------------------------------------------------------------------
// API Base URL — FORȚAT PENTRU CONEXIUNE LAN (Assignment 3)
// ---------------------------------------------------------------------------
// Am pus adresa IP direct aici pentru a ignora orice cache de .env
// ---------------------------------------------------------------------------
const __API_BASE__ = 'https://MPP-BarberApp.test';

axios.defaults.baseURL = __API_BASE__;

if (typeof window !== 'undefined') {
    window.__API_BASE__ = __API_BASE__;
    console.log("API conectat la: " + window.__API_BASE__);
}

createApp(MainApp).mount('#app');
