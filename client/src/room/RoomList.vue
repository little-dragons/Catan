<script setup lang="ts">
import { roomSocket } from '@/socketWrapper/Socket';
import type { LobbyRoom } from 'shared';
import { canJoinNewRoom, joinRoomAndRedirect } from '@/socketWrapper/Room';
import { ref } from 'vue';
import CreateRoomModal from './CreateRoomModal.vue';

const rooms = ref<LobbyRoom[]>([])

async function fetchRooms() {
    rooms.value = await roomSocket.emitWithAck('lobbyList')
}
fetchRooms()

const showCreateRoomsModal = ref(false)

</script>

<template>
    <h1>Room list</h1>
    <input type="button" value="Create Room" @click="() => showCreateRoomsModal = true" :disabled="!canJoinNewRoom"
        title="To create a room, you have to be logged in." />
    <input type="button" value="Refresh" @click="fetchRooms" />
    <div class="room heading">
        <p>Room name</p>
        <p>Players</p>
        <p>Owner</p>
    </div>
    <div v-for="room in rooms" class="room">
        <p>{{ room.name }}</p>
        <p>{{ room.users.length }} / ?</p>
        <p>{{ room.owner.name }}</p>
        <input 
            type="button" 
            value="Join" 
            class="default-button-colors"
            :disabled="!canJoinNewRoom"
            @click="() => joinRoomAndRedirect(room.id)"/>
    </div>
    <div v-if="rooms.length == 0">
        <p>Currently, there are no rooms. Create one at the top!</p>
    </div>

    <CreateRoomModal v-if="showCreateRoomsModal" @close="() => showCreateRoomsModal = false" />
</template>

<style scoped>
@import '../assets/base.css';


.room {
    border-bottom: var(--mute-border);
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 60% 15% 15% 10%;
    width: 100%;
}

.room > p {
    margin: 15px 0;
}

.room > input {
    margin: 13px auto;
    width: 80%;
    border-radius: 40px;
    border: var(--mute-border);
}

.heading {
    margin-top: 50px;
    font-weight: 600;
    font-style: italic;
}

.heading > p {
    margin-bottom: 4px;
    margin-top: 0;
}
</style>
