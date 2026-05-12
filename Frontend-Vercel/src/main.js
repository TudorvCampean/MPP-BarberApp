import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

import axios from 'axios';

// ---------------------------------------------------------------------------
// API Base URL — FORȚAT PENTRU CONEXIUNE LAN (Assignment 3)
// ---------------------------------------------------------------------------
// Am pus adresa IP direct aici pentru a ignora orice cache de .env
// ---------------------------------------------------------------------------
const apiBase = 'http://192.168.56.1:8080'; 

axios.defaults.baseURL = apiBase;

if (typeof window !== 'undefined') {
    window.__API_BASE__ = apiBase;
    console.log("API conectat la: " + window.__API_BASE__);
}

createApp(MainApp).mount('#app');