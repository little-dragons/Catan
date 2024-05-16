<script setup lang="ts">
import { Color, defaultBoard, BuildingType, SocketPort, type ServerEventMap, type ClientEventMap } from 'shared';
import BoardRenderer, { type BoardRendererExposes } from './drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from './drawing/board/Layout';
import { onMounted, ref, type Ref } from 'vue';
import { Socket, io } from 'socket.io-client';

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
board.buildings.push([Color.Green, [4,4], BuildingType.Settlement])

const renderer = ref(null) as Ref<null | (HTMLElement & BoardRendererExposes<string>)>
const messageFromServer = ref("Not received")
const socket = io(`ws://localhost:${SocketPort}`) as Socket<ClientEventMap, ServerEventMap>
socket.on('sendHello', x => {
    messageFromServer.value = x
    socket.emit('requestDisconnect', 'Goodbye')
})

onMounted(() => {
    renderer.value!.setInteractionPoints([[[300, 300], 'test']], x => console.log(x[1]))    
})


</script>

<template>
    <BoardRenderer ref="renderer" :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
    <p>Message from Server: {{ messageFromServer }}</p>
</template>
