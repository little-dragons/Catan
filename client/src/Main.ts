import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './misc/Router'
import { acceptGameEvents } from './socketWrapper/Game'
import { acceptLoginEvents } from './socketWrapper/Login'

const app = createApp(App)
app.use(router)
app.mount('#app')

acceptGameEvents()
acceptLoginEvents()