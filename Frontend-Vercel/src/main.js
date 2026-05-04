import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

// Poți seta URL-ul de bază pentru axios aici, ca să nu îl schimbi în fiecare componentă.
import axios from 'axios';
// IMPORTANT: Înlocuiește acest link cu cel generat de `herd share` când ești gata de prezentare!
axios.defaults.baseURL = 'https://pvl6j7b4en.sharedwithexpose.com';
// Make the same base URL available to non-axios code (the app uses fetch in some places).
// The developer can replace the string above with the `herd share` URL when exposing the
// local backend. Other modules can read `window.__API_BASE__` to target the backend host.
if (typeof window !== 'undefined') {
	window.__API_BASE__ = axios.defaults.baseURL;
}
createApp(MainApp).mount('#app');
