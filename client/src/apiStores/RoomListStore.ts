import { defineStore } from 'pinia'
import { type LobbyRoom, UserType, RoomType, type QueryServerEventMap, queryNamespace } from 'catan-shared'
import { ref, watch, } from 'vue'
import { serverAddress } from '@/misc/Globals'
import { io, Socket } from 'socket.io-client'


const socket: Socket<{}, QueryServerEventMap> = io(serverAddress + queryNamespace, {
    autoConnect: false,
    // this is required such that disconnecting with this socket does not affect the game socket
    forceNew: true
})

export const useRoomListStore = defineStore('roomList', () => {
    const lobbies = ref<LobbyRoom[]>([])

    const refreshInterval = ref(800)
    const autoRefresh = ref(false)
    
    async function update() {
        if (!socket.connected)
            socket.connect()

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
        else
            socket.disconnect()
    })

    return { lobbies, update, refreshInterval, autoRefresh }
})


