import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './misc/Router'

const app = createApp(App)
app.use(router)
app.mount('#app')
