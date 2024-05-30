<script setup lang="ts">
import type { RedactedGameState } from 'shared';
import BoardRenderer, { type InteractionPoints } from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref, watch } from 'vue';

defineEmits([ 'diceClicked' ])

const model = defineModel<RedactedGameState>({ required: true })
const boardRenderer = ref<null | InstanceType<typeof BoardRenderer>>(null)

const dice = ref<[number, number]>([1, 1])
watch(model, newVal => {
    if (newVal.phase.type == 'normal' && newVal.phase.diceRolled != false)
        dice.value = newVal.phase.diceRolled
})

function setInteractionPoints<Points extends InteractionPoints<any>>(points: Points, clicked: ((point: Points['data'][number]) => void)) {
    boardRenderer.value!.setInteractionPoints(points, clicked)
}
defineExpose({ setInteractionPoints })
</script>

<template>
    <p>Current phase: {{ modelValue.phase.type }}</p>
    <p>Current player: {{ modelValue.currentPlayer }}</p>
    <div>
        <BoardRenderer v-model="modelValue.board" ref="boardRenderer"/>
    </div>
    <div class="dice">
        <DiceRenderer v-model="dice" ref="diceRenderer" @dice-clicked="() => $emit('diceClicked')"/>
    </div>
</template>

<style scoped>
.dice {
    position: relative;
    width: 100px;
    height: 100px;
    z-index: 100;
    margin-right: 0;
    margin-left: auto;
}
</style>