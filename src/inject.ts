import { createApp } from 'vue';

// import ant design
import 'ant-design-vue/dist/reset.css';

import App from './App.vue';


const el = document.createElement('div');
el.id = 'easy-fill-ext';
document.body.appendChild(el);


const app = createApp(App);

app.mount('#easy-fill-ext');
