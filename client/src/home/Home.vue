<script setup lang="ts">
import { currentAuthUser, currentUser, sendLogout } from '@/socket/Login';
import { gameSocket, roomSocket } from '@/socket/Socket';
import type { Room } from 'shared';


let roomId = "undefined!"
async function startExperiment() {
    if (currentAuthUser.value == undefined)
        return

    const res = await roomSocket.emitWithAck('createAndJoin', 'Test room name', currentAuthUser.value.authToken)
    console.log(res)
    roomId = (res as Room).id
}
async function startOtherExperiment() {
    if (currentAuthUser.value == undefined)
        return

    const res = await roomSocket.emitWithAck('roomList')
    console.log(res)

    const room = await roomSocket.emitWithAck('join', res[0].id, currentAuthUser.value.authToken) as Room
    console.log(room)
    roomSocket.on('gameStarted', x => {
        console.log(x)
        const state = gameSocket.emitWithAck('gameState', room!.id, currentAuthUser.value!.authToken)
        console.log(state)
    })
}
async function start3Experiment() {
    if (currentAuthUser.value == undefined)
        return

    const start = await roomSocket.emitWithAck('startGame', roomId, currentAuthUser.value.authToken)
    console.log(start)
    const state = gameSocket.emitWithAck('gameState', roomId, currentAuthUser.value!.authToken)
    console.log(state)
}
</script>


<template>
    <h1>Home</h1>

    <button @click="sendLogout" v-if="currentUser.status == 'logged in'">Logout</button>
</template>
