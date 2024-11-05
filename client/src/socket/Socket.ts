import { defineStore } from "pinia";
import { type LobbyRoom, UserType, RoomType } from "shared";
import { ref, watch, } from "vue";
import { isDevelopment, isProduction } from "@/misc/Globals"
import { SocketPort, type ClientEventMap, type ServerEventMap } from "shared"
import { io, Socket } from "socket.io-client"

let address: string = undefined!
if (isDevelopment)
    address = `http://localhost:${SocketPort}`
else if (isProduction)
    address = `https://ichigancs.com:${SocketPort}`

export const socket: Socket<ClientEventMap, ServerEventMap> = io(address)


export const useRoomListStore = defineStore('roomList', () => {
    const lobbies = ref<LobbyRoom[]>([])

    const refreshInterval = ref(800)
    const autoRefresh = ref(false)
    
    async function update() {
        lobbies.value = await socket.emitWithAck('lobbyList')
    }

    async function autoUpdate() {
        await update()

        if (autoRefresh.value)
            setTimeout(autoUpdate, refreshInterval.value)
    }

    watch(autoRefresh, newVal => {
        if (newVal)
            autoUpdate()
    })

    return { lobbies, update, refreshInterval, autoRefresh }
})


