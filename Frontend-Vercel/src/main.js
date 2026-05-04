import { createApp } from 'vue';
import MainApp from './components/MainApp.vue';
import './style.css';

import axios from 'axios';
// Set this to the current `herd share MPP-BarberApp` URL before each presentation.
axios.defaults.baseURL = 'https://jveoxcchup.sharedwithexpose.com';
if (typeof window !== 'undefined') {
	window.__API_BASE__ = axios.defaults.baseURL;
}
createApp(MainApp).mount('#app');


