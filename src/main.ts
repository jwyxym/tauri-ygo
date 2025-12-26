import { createApp } from "vue";
import App from "./App.vue";
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Vue3StarrySky from 'vue3-starry-sky';
import 'vue3-starry-sky/lib/style.css';
import Varlet from '@varlet/ui'
import '@varlet/ui/es/style'

const resize = () => {
	document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
	document.documentElement.style.setProperty('--vw', `${window.innerWidth}px`);
}

resize();
window.addEventListener('resize', resize);

const app = createApp(App)

app.use(Toast, {})
app.use(Vue3StarrySky);
app.use(Varlet);

app.mount('#app')