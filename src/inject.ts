import { createApp } from 'vue'

// import css of ant-design-vue
import 'ant-design-vue/dist/reset.css'

// import vue3-context-menu
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import App from './App.vue'


const el = document.createElement('div')
el.id = 'easy-fill-ext'
document.body.appendChild(el)


const app = createApp(App)
app.use(ContextMenu)

app.mount('#easy-fill-ext')
