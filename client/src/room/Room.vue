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
    <Lobby v-if="currentRoom?.type == 'lobby'"/>
    <StateRenderer v-else-if="currentRoom?.type == 'ingame'" v-bind="currentRoom.state as unknown as RedactedGameState" />
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

