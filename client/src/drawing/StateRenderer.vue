<script setup lang="ts">
import type { RedactedGameState } from 'shared';
import BoardRenderer from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { ref, watch } from 'vue';

const model = defineModel<RedactedGameState>({ required: true })

const dice = ref<[number, number]>([1, 1])
watch(model, newVal => {
    if (newVal.phase.type == 'normal' && newVal.phase.diceRolled != false)
        dice.value = newVal.phase.diceRolled
})
</script>

<template>
    <p>Current phase: {{ modelValue.phase.type }}</p>
    <p>Current player: {{ modelValue.currentPlayer }}</p>
    <div>
        <BoardRenderer v-model="modelValue.board" ref="boardRenderer"/>
    </div>
    <div class="dice">
        <DiceRenderer v-model="dice" ref="diceRenderer"/>
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