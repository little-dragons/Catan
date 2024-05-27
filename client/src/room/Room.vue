<script setup lang="ts">
import { type RedactedGameState } from 'shared';
import StateRenderer from '@/drawing/StateRenderer.vue';
import { currentRoom, currentGameRoom } from '@/socketWrapper/Room';
import { finishTurn } from '@/socketWrapper/Game';
import router from '@/misc/Router';
import Lobby from './Lobby.vue';
import { computed } from 'vue';
import { gameSocket } from '@/socketWrapper/Socket';
import { currentAuthUser } from '@/socketWrapper/Login';

if (currentRoom.value == undefined) {
    router.push({ name: 'home' })
}

const stateRef = computed(() => {
    if (currentGameRoom.value?.state != undefined)
        return currentGameRoom.value.state as unknown as RedactedGameState
    else
        return undefined
})


async function place1() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[5,6], [5,5]], settlement: [5, 6]})
    console.log(res)
}
async function place2() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[3,4], [4,4]], settlement: [4, 4]})
    console.log(res)
}
async function place3() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[9,2], [10,2]], settlement: [10, 2]})
    console.log(res)
}
async function place4() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[7,4], [8,4]], settlement: [8, 4]})
    console.log(res)
}
</script>

<template>
    <Lobby v-if="currentRoom?.type == 'lobby'"/>
    <div v-else-if="stateRef != undefined">
        <button @click="place1">Place at 1</button>
        <button @click="place2">Place at 2</button>
        <button @click="place3">Place at 3</button>
        <button @click="place4">Place at 4</button>
        <button @click="finishTurn">Finish turn</button>
        <StateRenderer v-model="stateRef" />
    </div>
    <p v-else>This is not supposed to be shown. Try reloading the page.</p>
</template>

