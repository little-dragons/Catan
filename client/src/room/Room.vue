<script setup lang="ts">
import { type RedactedGameState } from 'shared';
import StateRenderer from '@/drawing/StateRenderer.vue';
import { currentRoom } from '@/socketWrapper/Room';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';

if (currentRoom.value == undefined) {
    alert('you have to be in a room, to view this page, redirecting')
    router.push({ name: 'home' })
}

</script>

<template>
    <div v-if="currentRoom?.type == 'lobby'">
        <Lobby />
    </div>
    <div v-else-if="currentRoom?.type == 'ingame'">
        <StateRenderer v-bind="currentRoom.state as unknown as RedactedGameState" />
    </div>
    <div v-else>
        <p>This is not supposed to be shown. Try reloading the page.</p>
    </div>
    
</template>

