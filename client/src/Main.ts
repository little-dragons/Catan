import './assets/base.css'

import { computed, createApp, ref, type Ref } from 'vue'
import App from './App.vue'
import router from './Router'
import { SocketPort, type ClientEventMap, type ServerEventMap } from 'shared'
import { Socket, io } from 'socket.io-client'
import { UserKey, SocketKey, type UserLoginStatus, UserLoginStatusKey } from './InjectionKeys'

const app = createApp(App)

app.use(router)

let address: string = undefined!
if (process.env.NODE_ENV == 'development')
    address = `http://localhost:${SocketPort}`
else if (process.env.NODE_ENV == 'production')
    address = `https://ichigancs.com:${SocketPort}`
else
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

const socket = io(address, {
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
