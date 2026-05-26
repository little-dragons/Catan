<script setup lang="ts">
import { RoomType } from 'catan-shared';
import { watch } from 'vue';
import { useCurrentRoomStore } from '@/apiStores/CurrentRoomStore';
import Game from '@/game/Game.vue';
import History from '@/game/History.vue';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';

const roomStore = useCurrentRoomStore()

watch(roomStore, () => {
    if (roomStore.info === undefined)
        router.push({ name: 'home' })
}, { immediate: true })

</script>

<template>
    <Lobby v-if="roomStore.info?.data.type === RoomType.Lobby"/>
    <Game v-else-if="roomStore.info?.data.type === RoomType.InGame" />
    <div v-else-if="roomStore.info?.data.type === RoomType.PostGame">
        <button type="button" @click="() => roomStore.tryLeave()">Leave the room</button>
        <History :history="roomStore.info.data.history"/>
    </div>
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

