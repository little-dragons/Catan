<script setup lang="ts">
import type { RedactedGameState } from 'shared';
import BoardRenderer from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { toRefs, type DeepReadonly } from 'vue';

const props = defineProps<RedactedGameState>()
const refProps = toRefs(props)

</script>

<template>
    <div>
        <BoardRenderer :board="refProps.board" ref="boardRenderer"/>
    </div>
    <div class="dice">
        <DiceRenderer :dice="refProps.dice" ref="diceRenderer"/>
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