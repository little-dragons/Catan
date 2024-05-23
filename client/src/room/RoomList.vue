<script setup lang="ts">
import { roomSocket } from '@/socket/Socket';
import { currentAuthUser } from '@/socket/Login';
import type { Room } from 'shared';
import { createApp, createVNode, ref } from 'vue';
import CreateRoomModal from './CreateRoomModal.vue';

const rooms = ref<Room[]>([])

async function fetchRooms() {
    rooms.value = await roomSocket.emitWithAck('roomList')
}
fetchRooms()

const showModal = ref(false)

</script>

<template>
    <h1>Room list</h1>
    <input type="button" value="Create Room" @click="() => showModal = true" :disabled="currentAuthUser == undefined" title="To create room, you have to be logged in." />
    <input type="button" value="Refresh" @click="fetchRooms"/>
    <div v-for="room in rooms">
        {{  room.name }}
    </div>
    <div v-if="rooms.length == 0">
        <p>Currently, there are no rooms. Create one at the top!</p>
    </div>

    <CreateRoomModal v-if="showModal" @close="() => showModal = false"/>
</template>
