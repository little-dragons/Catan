<script setup lang="ts">
import { currentAuthUser } from '@/socket/Login';
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
    <p>Hi!</p>

    <RouterLink to="/room/2">Random room</RouterLink>
    <input type="button" @click="startExperiment">Very dangerous experiment</input>
    <input type="button" @click="startOtherExperiment">Other experiment</input>
    <input type="button" @click="start3Experiment">Third experiment</input>
</template>
