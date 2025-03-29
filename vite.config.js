import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    lib: {
      entry: {
        'js/content-script': 'src/main.js',
        'js/inject': 'src/inject.js',
      },
      name: 'MyLib',
      formats: ['es'],
      cssFileName: "css/inject",
    },
  },
  define: {
    'process.env': {},
  },
})
