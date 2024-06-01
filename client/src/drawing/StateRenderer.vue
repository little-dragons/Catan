<script setup lang="ts">
import { type RedactedGameState, Resource, type Board } from 'shared';
import BoardRenderer, { type InteractionPoints } from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref, watch } from 'vue';
import CardRenderer from './CardRenderer.vue';

defineEmits<{
    diceClicked: []
    resourceClicked: [resource: Resource]
    endTurnClicked: []
}>()

defineProps<{
    stockedCards: Resource[]
    offeredCards: Resource[]
    board: Board
    dice: [number, number] | undefined
    canEndTurn: boolean
}>()

const boardRenderer = ref<null | InstanceType<typeof BoardRenderer>>(null)

function setInteractionPoints<T>(points: InteractionPoints<T> | undefined) {
    boardRenderer.value!.setInteractionPoints(points)
}
defineExpose({ setInteractionPoints })
</script>

<template>
    <div>
        <BoardRenderer :board="board" ref="boardRenderer"/>
    </div>
    <div class="below">
        <div class="dice" v-if="dice != undefined">
            <DiceRenderer :dice="dice" ref="diceRenderer" @dice-clicked="() => $emit('diceClicked')"/>
        </div>
        <div class="cards">
            <CardRenderer :cards="stockedCards" @resource-clicked="res => $emit('resourceClicked', res)"/>
        </div>
        <div class="buttons">
            <button class="default-button-colors" @click="() => $emit('endTurnClicked')" :disabled="!canEndTurn">Finish turn</button>
        </div>
    </div>
</template>

<style scoped>
.below {
    padding-top: 10px;
    position: relative;
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 70% auto auto auto;
    gap: 10px;
    flex-direction: row;
}

.dice {
    position: absolute;
    right: 0;
    top: -50px;
    width: 100px;
    z-index: 100;
    margin-right: 0;
    margin-left: auto;
}

.cards {
}

.buttons > button {
    height: 100%;
    border: 1px solid black;
    border-radius: 10px;
}

.buttons > button:hover:enabled {
    cursor: pointer;
}
.buttons > button:hover:not(:enabled) {
    cursor: not-allowed;
}

</style>