<script setup lang="ts">
import { roomSocket } from '@/socketWrapper/Socket';
import { type LobbyRoom } from 'shared';
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
    <div class="grid-columns heading default-grid-header-layout">
        <p>Room name</p>
        <p>Players</p>
        <p>Owner</p>
    </div>
    <div v-for="room in rooms" class="grid-columns default-grid-layout">
        <p>{{ room.name }}</p>
        <p>{{ room.users.length }} / ?</p>
        <p>{{ room.owner.name }}</p>
        <button
            class="default-button-colors"
            :disabled="!canJoinNewRoom"
            @click="() => joinRoomAndRedirect(room.id)">Join</button>
    </div>
    <div v-if="rooms.length == 0">
        <p>Currently, there are no rooms. Create one at the top!</p>
    </div>

    <CreateRoomModal v-if="showCreateRoomsModal" @close="() => showCreateRoomsModal = false" />
</template>

<style scoped>

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
