<script setup lang="ts">
import { allPositions, type Board } from '@/logic/Board'
import { onMounted, ref, toRefs, type Ref } from 'vue';
import * as d3 from 'd3'
import { tileHexagon, tileCenter, type BoardRenderInfo, tileResourceIcon } from '@/drawing/BoardRendering';
import brick from '@/assets/brick.svg'

const props = defineProps<BoardRenderInfo>()
const refProps = toRefs(props)

const boardSvg = ref(null) as Ref<null | HTMLElement>

function renderTiles() {
    // clean previous tiles
    d3.select(boardSvg.value!)
      .select('#board')
      .remove()

    // make group
    const group = 
        d3.select(boardSvg.value!)
        .append('g')
            .attr('id', 'board')
    
    const enter = 
        group
        .selectAll()
        .data(allPositions(props.board))
        .enter()

    enter
      .append('path')
        .attr('d', x => d3.line()(tileHexagon(x, props)))
        .attr('fill', 'blue')
    
    enter
      .append('image')
        .datum(x => tileResourceIcon(x, props))
        .attr('x', x => x.topLeft[0])
        .attr('y', x => x.topLeft[1])
        .attr('width', x => x.size[0])
        .attr('height', x => x.size[1])
        .attr('href', brick)

}

function renderEverything() {
    renderTiles()
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

