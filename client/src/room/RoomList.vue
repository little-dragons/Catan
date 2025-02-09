<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import { useRoomListStore } from '@/socket/Socket';
import router from '@/misc/Router';
import { ModalType, useModalStore } from '@/modals/ModalStore';

const currentRoom = useCurrentRoomStore()
const roomList = useRoomListStore()
const modalStore = useModalStore()

async function tryJoin(roomId: string) {
    const result = await currentRoom.tryJoin(roomId)
    // TODO
    router.push('/room')
}

onMounted(() => roomList.autoRefresh = true)
onUnmounted(() => roomList.autoRefresh = false)
</script>

<template>
    <h1>Room list</h1>
    <input type="button" value="Create New Room" @click="() => modalStore.value = ModalType.CreateRoom" :disabled="!currentRoom.canJoin"
        title="Create New Room" />
    <input type="button" value="Refresh" @click="roomList.update"/>
    <input type="checkbox" id="autoRefresh" value="Refresh" v-model="roomList.autoRefresh"/>
    <label for="autoRefresh">Auto refresh</label>
    <div class="grid-columns heading default-grid-header-layout">
        <p>Room name</p>
        <p>Players</p>
        <p>Owner</p>
    </div>
    <div v-for="room in roomList.lobbies" class="grid-columns default-grid-layout">
        <p>{{ room.name }}</p>
        <p>{{ room.users.length }} / ?</p>
        <p>{{ room.owner.name }}</p>
        <button
            class="default-button-colors"
            :title="`Join room ${room.name}`"
            :disabled="!currentRoom.canJoin"
            @click="() => tryJoin(room.id)">Join</button>
    </div>
    <div v-if="roomList.lobbies.length == 0">
        <p>Currently, there are no rooms. Create one at the top!</p>
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
