<script setup lang="ts">
import { Resource, type Board } from 'shared';
import BoardRenderer, { type InteractionPoints } from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref } from 'vue';
import CardsRenderer from './CardsRenderer.vue';
import PlayerOverviewRenderer, { type PlayerOverviewData } from './PlayerOverviewRenderer.vue';

defineEmits<{
    diceClicked: []
    resourceClicked: [resource: Resource]
    endTurnClicked: []
}>()

defineProps<{
    stockedCards: Resource[]
    offeredCards: Resource[]
    board: Board
    isMyTurn: boolean
    dice: [number, number] | undefined
    canEndTurn: boolean
    otherPlayers: PlayerOverviewData[]
}>()

const boardContainer = ref<null | HTMLDivElement>(null)
const boardWidth = ref(300)
onMounted(() => {
    boardWidth.value = boardContainer.value!.children[0].clientWidth
    new ResizeObserver((entries, observer) => {
        if (boardContainer.value == undefined)
            return
        
        boardWidth.value = boardContainer.value!.children[0].clientWidth
    }).observe(boardContainer.value!.children[0])
})
const boardRenderer = ref<null | InstanceType<typeof BoardRenderer>>(null)
defineExpose({ setInteractionPoints<T>(args: InteractionPoints<T> | undefined) { boardRenderer.value!.setInteractionPoints(args)} })
</script>

<template>
    <div class="other-players">
        <PlayerOverviewRenderer class="upper-left" v-if="otherPlayers.length >= 1" v-bind="otherPlayers[0]"/>
        <PlayerOverviewRenderer class="upper-right" v-if="otherPlayers.length >= 2" v-bind="otherPlayers[1]"/>
        <PlayerOverviewRenderer class="middle-left" v-if="otherPlayers.length >= 3" v-bind="otherPlayers[2]"/>
        <PlayerOverviewRenderer class="middle-right" v-if="otherPlayers.length >= 4" v-bind="otherPlayers[3]"/>
    </div>
    <div ref="boardContainer"class="main-box">   
            <BoardRenderer class="board" :board="board" ref="boardRenderer"/>
        <div class="below">
            <DiceRenderer class="dice" v-if="dice != undefined" :dice="dice" ref="diceRenderer" @dice-clicked="() => $emit('diceClicked')"/>
            <CardsRenderer :cards="stockedCards" @resource-clicked="res => $emit('resourceClicked', res)"/>
            <div class="buttons">
                <button class="default-button-colors" @click="() => $emit('endTurnClicked')" :disabled="!canEndTurn">Finish turn</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.other-players {
    position: absolute;
    top: 50%;
    left: 50%;

    --board-width: v-bind('boardWidth');
    --radius: calc(100px + 1px * var(--board-width) / 2);
    --upper-rotate-angle: 45deg;
    --middle-rotate-angle: 15deg;
}


.middle-left {
    position: absolute;
    top: 0;
    transform: rotate(var(--middle-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--middle-rotate-angle))) translateX(-50%);
}
.middle-right {
    position: absolute;
    top: 0;
    transform: rotate(calc(-1 * var(--middle-rotate-angle))) translateX(var(--radius)) rotate(var(--middle-rotate-angle)) translateX(-50%);
}

.upper-left {
    position: absolute;
    top: 0;
    transform: rotate(var(--upper-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--upper-rotate-angle))) translateX(-50%);
}
.upper-right {
    position: absolute;
    top: 0;
    transform: rotate(calc(-1 * var(--upper-rotate-angle))) translateX(var(--radius)) rotate(var(--upper-rotate-angle)) translateX(-50%);
}


.main-box {
    height: calc(100% - 30px);
    width: max(100%, 900px);
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    margin-top: 30px;
}

.board {
    flex: 1 1;
    min-height: 0;
    display: flex;
}

.below {
    flex-shrink: 0;
    padding-top: 10px;
    position: relative;
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 50% auto auto auto;
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