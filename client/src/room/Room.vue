<script setup lang="ts">
import { currentRoom } from '@/socketWrapper/Room';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';
import Game from './Game.vue';

if (currentRoom.value == undefined) {
    router.push({ name: 'home' })
}

</script>

<template>
    <Lobby v-if="currentRoom?.type == 'lobby'"/>
    <Game v-else-if="currentRoom?.type == 'ingame'" />
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

