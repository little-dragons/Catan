<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { renderBuildings, renderInteractionPoints, renderRoads, renderRobber, renderTiles } from './SvgManipulation';
import type { Board } from '@/logic/Board';
import { distance } from '../Vector';
import { interactionPointRadius } from './Layout';

export type BoardRenderInfo = {
    board: Board
    tileRadius: number
}
export type BoardRendererExposes<T> = {
    setInteractionPoints: (points: InteractionPoint<T>[], clicked: ((point: InteractionPoint<T>) => void) | undefined) => void
}

const props = defineProps<BoardRenderInfo>()

const boardSvg = ref(null) as Ref<null | HTMLElement & SVGElement>

function renderEverything() {
    renderTiles(boardSvg.value!, props)
    renderRoads(boardSvg.value!, props)
    renderRobber(boardSvg.value!, props)
    renderBuildings(boardSvg.value!, props)
}

export type InteractionPoint<T> = [[number, number], T]

let activeClickHandler = (_: MouseEvent) => {}
function setInteractionPoints<T>(points: InteractionPoint<T>[], clicked: ((point: InteractionPoint<T>) => void) | undefined) {
    renderInteractionPoints(boardSvg.value!, props, points)

    if (clicked == undefined)
        activeClickHandler = _ => {}
    else
        activeClickHandler = (ev: MouseEvent) => {
            if (points.length == 0 || activeClickHandler == undefined)
                return

            for (const p of points) {
                if (distance([ev.offsetX, ev.offsetY], p[0]) < interactionPointRadius(props.tileRadius))
                    clicked(p)
            }
        }
}

defineExpose({ setInteractionPoints })

onMounted(renderEverything)
</script>

<template>
    <svg ref="boardSvg" @click="activeClickHandler"/>
</template>

<style scoped>
svg {
    width: 100%;
    height: 100%;
}
</style>

