import { createApp } from 'vue';

// import ant design
import 'ant-design-vue/dist/antd.css';

import App from './app.vue';
import config from './config.js';

const currentConfig = config.find(({ path }) => path === location.pathname);
const el = currentConfig.inject('easy-fill-ext');

const app = createApp(App);
app.mount(el);
