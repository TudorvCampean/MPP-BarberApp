import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

// Poți seta URL-ul de bază pentru axios aici, ca să nu îl schimbi în fiecare componentă.
import axios from 'axios';
// IMPORTANT: Înlocuiește acest link cu cel generat de `herd share` când ești gata de prezentare!
axios.defaults.baseURL = 'https://pvl6j7b4en.sharedwithexpose.com';

createApp(MainApp).mount('#app');
