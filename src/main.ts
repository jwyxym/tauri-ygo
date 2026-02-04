import { createApp } from 'vue';
import TauriYGO from './tauri-ygo.vue';
import Vue3StarrySky from 'vue3-starry-sky';
import 'vue3-starry-sky/lib/style.css';
import Varlet from '@varlet/ui';
import '@varlet/ui/es/style';

const ygopro = createApp(TauriYGO);

ygopro.use(Vue3StarrySky);
ygopro.use(Varlet);

ygopro.mount('#ygopro');