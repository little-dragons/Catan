import './assets/base.css'

import { computed, createApp, ref, type Ref } from 'vue'
import App from './App.vue'
import router from './Router'
import { SocketPort, type ClientEventMap, type ServerEventMap } from 'shared'
import { Socket, io } from 'socket.io-client'
import { UserKey, SocketKey, type UserLoginStatus, UserLoginStatusKey } from './InjectionKeys'

const app = createApp(App)

app.use(router)


const socket = io(`ws://localhost:${SocketPort}`, {
}) as Socket<ClientEventMap, ServerEventMap>

app.provide(SocketKey, socket)


const userLoginStatusRef = ref<UserLoginStatus>(['anonymous'])
app.provide(UserLoginStatusKey, userLoginStatusRef)

const userRef = computed(() => {
    const status = userLoginStatusRef.value
    if (status[0] == 'logged in')
        return status[1]
    else
        return undefined
})

app.provide(UserKey, userRef)


app.mount('#app')
