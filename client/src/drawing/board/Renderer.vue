<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { renderBuildings, renderInteractionPoints, renderRoads, renderRobber, renderTiles } from './SvgManipulation';
import type { Board, Coordinate } from 'shared';
import { distance } from '../Vector';
import { crossingPosition, interactionPointRadius, roadCenter } from './Layout';

const props = defineProps<{ board: Board }>()
const tileRadius = 100
const viewboxWidth = tileRadius * 2 * (props.board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)
const viewboxHeight = tileRadius * (props.board.rowCount * 1.5 + 0.5)

const boardSvg = ref<null | SVGElement>(null)

function renderEverything() {
    renderTiles(boardSvg.value!, props.board, tileRadius)
    renderRoads(boardSvg.value!, props.board, tileRadius)
    renderRobber(boardSvg.value!, props.board, tileRadius)
    renderBuildings(boardSvg.value!, props.board, tileRadius)
}

export type InteractionPoints<Payload> = {
    type: 'settlement'
    data: [Coordinate, Payload][]
} | {
    type: 'road'
    data: [[Coordinate, Coordinate], Payload][]
}


let activeClickHandler = (_: MouseEvent) => {}
function setInteractionPoints<Points extends InteractionPoints<any>>(points: Points, clicked: ((point: Points['data'][number]) => void)) {
    renderInteractionPoints(boardSvg.value!, props.board, points, tileRadius)

    activeClickHandler = (ev: MouseEvent) => {
        // this is because of the viewbox property of the svg
        // only works if the svg element has the same aspect ratio as the viewbox
        const clickedPosition = [
            viewboxWidth / boardSvg.value!.clientWidth * ev.offsetX,
            viewboxHeight / boardSvg.value!.clientHeight * ev.offsetY
        ] as [number, number]

        if (points.type == 'settlement') {
            for (const p of points.data)
                if (distance(clickedPosition, crossingPosition(p[0], tileRadius)) < interactionPointRadius(tileRadius))
                    clicked(p)
        }
        else if (points.type == 'road') {
            for (const p of points.data)
                if (distance(clickedPosition, roadCenter(p[0][0], p[0][1], tileRadius)) < interactionPointRadius(tileRadius))
                    clicked(p)
        }
    }
}

defineExpose({ setInteractionPoints })
watch(props, () => renderEverything())
onMounted(renderEverything)
</script>

<template>
    <svg :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`" ref="boardSvg" @click="activeClickHandler">
    </svg>
</template>



