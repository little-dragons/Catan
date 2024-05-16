<script setup lang="ts">
import { Color, defaultBoard, BuildingType, SocketPort, type ServerEventMap, type ClientEventMap, type Board } from 'shared';
import BoardRenderer, { type BoardRendererExposes } from './drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from './drawing/board/Layout';
import { onMounted, ref, type Ref } from 'vue';
import { Socket, io } from 'socket.io-client';

const board = ref(null) as Ref<null | Board>

const renderer = ref(null) as Ref<null | (HTMLElement & BoardRendererExposes<string>)>

const socket = io(`ws://localhost:${SocketPort}`) as Socket<ClientEventMap, ServerEventMap>
socket.emit('requestState')
socket.on('state', x => board.value = x.board)

onMounted(() => {
    // renderer.value!.setInteractionPoints([[[300, 300], 'test']], x => console.log(x[1]))    
})


</script>

<template>
    <BoardRenderer v-if="board != null" ref="renderer" :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
    <p v-else>Loading...</p>
</template>
