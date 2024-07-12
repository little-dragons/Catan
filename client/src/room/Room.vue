<script setup lang="ts">
import { currentRoom } from '@/socketWrapper/Room';
import { RoomType } from 'shared';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';
import Game from './Game.vue';
import { watch } from 'vue';

watch(currentRoom, () => {
    if (currentRoom.value == undefined)
        router.push({ name: 'home' })
}, { immediate: true })

</script>

<template>
    <Lobby v-if="currentRoom?.type == RoomType.Lobby"/>
    <Game v-else-if="currentRoom?.type == RoomType.InGame" />
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

