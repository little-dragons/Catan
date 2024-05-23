<script setup lang="ts">
import type { RedactedGameState } from 'shared';
import BoardRenderer from './board/Renderer.vue';
import DiceRenderer from './dice/Renderer.vue';
import { toRefs, watch } from 'vue';

const props = defineProps<RedactedGameState>()
const refProps = toRefs(props)
watch(props, () => console.log('propagated first level'))
</script>
<template>
    <div class="board">
        <BoardRenderer :board="refProps.board" ref="boardRenderer"/>
    </div>
    <div class="dice">
        <DiceRenderer :dice="refProps.dice" ref="diceRenderer"/>
    </div>
</template>

<style scoped>
.board {
}
.dice {
    position: relative;
    width: 100px;
    height: 100px;
    z-index: 100;
    margin-right: 0;
    margin-left: auto;
}
</style>