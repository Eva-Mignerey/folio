import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/fragment-mono/latin-400.css'
import App from './App.vue'
import router from './router'
import './styles/main.scss'

createApp(App).use(createPinia()).use(router).mount('#app')