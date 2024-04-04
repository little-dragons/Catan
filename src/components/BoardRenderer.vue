<script setup lang="ts">
import { allPositions, type Board } from '@/logic/Board'
import { onMounted, ref, toRefs, type Ref } from 'vue';
import * as d3 from 'd3'

const props = defineProps<{
    board: Board
}>()
const refProps = toRefs(props)
const boardSvg = ref(null) as Ref<null | HTMLElement>

function renderTiles() {
    console.log(allPositions(props.board))
    d3.select(boardSvg.value!)
      .selectAll('#board')
      .remove()

    d3.select(boardSvg.value!)
      .selectAll()
      .data(allPositions(props.board))
      .enter()
        .append('path')
        .attr('d', x => d3.line()([[20, 20], [40, 40], [20, 40]]))
        .attr('id', 'board')
        .attr('fill', 'blue')
}

function renderEverything() {
    renderTiles()
}

onMounted(renderEverything)
</script>

<template>
    <svg ref="boardSvg"></svg>
</template>

