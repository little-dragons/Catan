<script setup lang="ts">
import { onMounted, ref, toRefs, type Ref } from 'vue';
import { renderRoads, renderTiles } from './SvgManipulation';
import type { Board } from '@/logic/Board';

export type BoardRenderInfo = {
    board: Board
    tileRadius: number
}

const props = defineProps<BoardRenderInfo>()

const boardSvg = ref(null) as Ref<null | HTMLElement & SVGElement>

function renderEverything() {
    renderTiles(boardSvg.value!, props)
    renderRoads(boardSvg.value!, props)
}

type InteractionPoint = [[number, number], any]
const interactionPoints = ref([]) as Ref<InteractionPoint[]>
function setInteractionPoints(points: InteractionPoint[], clicked: (point: InteractionPoint) => void) {

}
defineExpose({ setInteractionPoints })

onMounted(renderEverything)
</script>

<template>
    <svg ref="boardSvg" />
</template>

<style scoped>
svg {
    width: 100%;
    height: 100%;
}
</style>

