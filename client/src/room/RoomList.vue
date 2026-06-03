<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RoomOPResult, useCurrentRoomStore } from '@/apiStores/CurrentRoomStore'
import { useRoomListStore } from '@/apiStores/RoomListStore'
import { createRoomModalID } from '@/misc/Globals'
import router from '@/misc/Router'
import { PopupSeverity, usePopups } from '@/popup/Popup'

const currentRoom = useCurrentRoomStore()
const popups = usePopups()
const roomList = useRoomListStore()

async function tryJoin(roomId: string) {
    const result = await currentRoom.tryJoin(roomId)
    if (result === RoomOPResult.Success) {
        router.push('/room')
        return
    }

    popups.insert({
        autoCloses: false,
        message: `Joining failed with reason: ${RoomOPResult[result]}`,
        severity: PopupSeverity.Info,
        title: 'Joining failed'
    })
}

function tryCreateOfflineAndMove() {
    const res = currentRoom.tryCreateOffline()
    if (res === RoomOPResult.Success) {
        router.push('/room')
        return
    }

    
}

onMounted(() => roomList.autoRefresh = true)
onUnmounted(() => roomList.autoRefresh = false)
</script>

<template>
    <h1>Room list</h1>
    <button type="button" 
            value="Create New Room" 
            :commandFor="createRoomModalID" 
            command="show-modal" 
            :disabled="!currentRoom.canJoinOnline"
            title="Create New Room">
            Create new room
    </button>
    <button type="button" 
            value="Create Offline Room" 
            @click="tryCreateOfflineAndMove" 
            :disabled="currentRoom.info !== undefined">
            Create offline room
    </button>
    <div class="grid-columns heading default-grid-header-layout">
        <p>Room name</p>
        <p>Players</p>
        <p>Owner</p>
    </div>
    <div v-for="room in roomList.lobbies" class="grid-columns default-grid-layout">
        <p>{{ room.name }}</p>
        <p>{{ room.participants.length }} / {{ room.scenario.players.maxAllowedCount }}</p>
        <p>{{ room.owner.name }}</p>
        <button
            type="button"
            class="default-button-colors"
            :title="`Join room ${room.name}`"
            :disabled="!currentRoom.canJoinOnline || room.participants.length >= room.scenario.players.maxAllowedCount"
            @click="() => tryJoin(room.id)">Join</button>
    </div>
    <div v-if="roomList.lobbies.length === 0">
        <p>Currently, there are no open lobbies. Create one at the top!</p>
    </div>
</template>

<style scoped>
@import '../assets/base.css';

.grid-columns {
    grid-template-columns: 55% 15% 20% 10%;
}

.grid-columns > button {
    margin: inherit auto;
    width: 80%;
    border-radius: 40px;
    border: var(--mute-border);
    height: 2rem;
}


.heading {
    margin-top: 50px;
}

</style>
