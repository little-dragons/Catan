<script setup lang="ts">
import { RoomType } from 'catan-shared';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';
import Game from '@/game/Game.vue';
import { watch } from 'vue';
import History from '@/game/History.vue';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';

const roomStore = useCurrentRoomStore()

watch(roomStore, () => {
    if (roomStore.info == undefined)
        router.push({ name: 'home' })
}, { immediate: true })

</script>

<template>
    <Lobby v-if="roomStore.info?.data.type === RoomType.Lobby"/>
    <Game v-else-if="roomStore.info?.data.type === RoomType.InGame" />
    <History v-else-if="roomStore.info?.data.type === RoomType.PostGame" :history="roomStore.info.data.history" />
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

