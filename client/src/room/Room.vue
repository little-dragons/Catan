<script setup lang="ts">
import { Color, defaultBoard, type RedactedGameState } from 'shared';
import { ref, type Ref } from 'vue';
import { currentAuthUser } from '@/socket/Login';
import { gameSocket } from '@/socket/Socket';
import StateRenderer from '@/drawing/StateRenderer.vue';
import { currentRoom } from '@/socket/Room';

const state = ref(
    {
        board: defaultBoard(0),
        dice: [1, 2],
        players: [],
        currentPlayer: Color.Blue,
        self: {
            color: Color.Blue,
            name: 'name',
            isGuest: true,
            handCards: [],
        },
    } as RedactedGameState
) as Ref<null | RedactedGameState>


gameSocket.on('gameEvent', async () => {
    const res = await gameSocket.emitWithAck('gameState', currentRoom.value!.id, currentAuthUser.value!.authToken)
    state.value = res as RedactedGameState
})



</script>

<template>
    <StateRenderer v-if="state != null" v-bind="state" />
    <p v-else>Loading...</p>
</template>

