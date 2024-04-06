<script setup lang="ts">
import { onMounted, ref, toRefs, type Ref } from 'vue';
import { renderTiles } from './SvgManipulation';
import type { Board } from '@/logic/Board';

export type BoardRenderInfo = {
    board: Board
    tileRadius: number
}

const props = defineProps<BoardRenderInfo>()
const refProps = toRefs(props)

const boardSvg = ref(null) as Ref<null | HTMLElement & SVGElement>

function renderEverything() {
    renderTiles(boardSvg.value!, props)
}

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

