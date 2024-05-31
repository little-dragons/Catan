<script setup lang="ts">
import { type RedactedGameState, Resource } from 'shared';
import BoardRenderer, { type InteractionPoints } from './board/Renderer.vue';
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref, watch } from 'vue';
import CardRenderer from './CardRenderer.vue';

defineEmits([ 'diceClicked' ])

const model = defineModel<RedactedGameState>({ required: true })
const props = defineProps<{
    stockedCards: Resource[]
    offeredCards: Resource[]
}>()

const boardRenderer = ref<null | InstanceType<typeof BoardRenderer>>(null)

const dice = ref<[number, number]>([1, 1])
watch(model, newVal => {
    if (newVal.phase.type == 'normal' && newVal.phase.diceRolled != false)
        dice.value = newVal.phase.diceRolled
})

function setInteractionPoints<Points extends InteractionPoints<any>>(points: Points, clicked: ((point: Points['data'][number]) => void)) {
    boardRenderer.value!.setInteractionPoints(points, clicked)
}
function clearInteractionPoints() {
    // TODO
}
defineExpose({ setInteractionPoints, clearInteractionPoints })
</script>

<template>
    <div>
        <BoardRenderer v-model="modelValue.board" ref="boardRenderer"/>
    </div>
    <div class="below">
        <div class="dice">
            <DiceRenderer v-model="dice" ref="diceRenderer" @dice-clicked="() => $emit('diceClicked')"/>
        </div>
        <div class="cards">
            <CardRenderer :cards="stockedCards"/>
        </div>
    </div>
</template>

<style scoped>
.below {
    position: relative;
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
    padding-top: 10px;
    max-width: 30rem;
}

</style>