import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './misc/Router'
import { acceptGameEvents } from './socketWrapper/Game'
// import { acceptLoginEvents } from './socketWrapper/Login'
import { acceptRoomEvents } from './socketWrapper/Room'
import { acceptLobbyEvents } from './socketWrapper/Lobby'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')

// acceptLoginEvents()
acceptRoomEvents()
acceptLobbyEvents()
acceptGameEvents()