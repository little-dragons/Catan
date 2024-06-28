import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './misc/Router'
import { acceptGameEvents } from './socketWrapper/Game'
// import { acceptLoginEvents } from './socketWrapper/Login'
import { acceptRoomEvents } from './socketWrapper/Room'
import { acceptLobbyEvents } from './socketWrapper/Lobby'

const app = createApp(App)
app.use(router)
app.mount('#app')

// acceptLoginEvents()
acceptRoomEvents()
acceptLobbyEvents()
acceptGameEvents()