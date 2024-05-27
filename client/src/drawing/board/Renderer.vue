<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { renderBuildings, renderInteractionPoints, renderRoads, renderRobber, renderTiles } from './SvgManipulation';
import type { Board } from 'shared';
import { distance } from '../Vector';
import { interactionPointRadius, minimalFillingTileRadius } from './Layout';

const model = defineModel<Board>({ required: true })
const tileRadius = computed(() => minimalFillingTileRadius(model.value, 1000, 1000))
const boardSvg = ref<null | HTMLElement & SVGElement>(null)

function renderEverything() {
    renderTiles(boardSvg.value!, model.value, tileRadius.value)
    renderRoads(boardSvg.value!, model.value, tileRadius.value)
    renderRobber(boardSvg.value!, model.value, tileRadius.value)
    renderBuildings(boardSvg.value!, model.value, tileRadius.value)
}

export type InteractionPoint<T> = [[number, number], T]

let activeClickHandler = (_: MouseEvent) => {}
function setInteractionPoints<T>(points: InteractionPoint<T>[], clicked: ((point: InteractionPoint<T>) => void) | undefined) {
    renderInteractionPoints(boardSvg.value!, model.value, points, tileRadius.value)

    if (clicked == undefined)
        activeClickHandler = _ => {}
    else
        activeClickHandler = (ev: MouseEvent) => {
            if (points.length == 0 || activeClickHandler == undefined)
                return

            for (const p of points) {
                if (distance([ev.offsetX, ev.offsetY], p[0]) < interactionPointRadius(tileRadius.value))
                    clicked(p)
            }
        }
}

defineExpose({ setInteractionPoints })
watch(model, () => renderEverything())
onMounted(renderEverything)
</script>

<template>
    <svg viewBox= "0 0 1000 1000" ref="boardSvg" @click="activeClickHandler"/>
</template>

