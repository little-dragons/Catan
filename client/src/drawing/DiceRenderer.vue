<script setup lang="ts">
import * as d3 from 'd3';
import { onMounted, ref, watch, type Ref } from 'vue';
import oneDie from '@/assets/dice/one-die.svg'
import twoDie from '@/assets/dice/two-die.svg'
import threeDie from '@/assets/dice/three-die.svg'
import fourDie from '@/assets/dice/four-die.svg'
import fiveDie from '@/assets/dice/five-die.svg'
import sixDie from '@/assets/dice/six-die.svg'
import { rollDice } from '@/socketWrapper/Game';


function diceToIcon(die: number): string {
    switch (die) {
        case 1:
            return oneDie
        case 2:
            return twoDie
        case 3:
            return threeDie
        case 4:
            return fourDie
        case 5:
            return fiveDie
        case 6:
            return sixDie
    }
    console.warn('Invalid dice number')
    return ''
}

const model = defineModel<[number, number]>({ required: true})

const svg = ref<null | HTMLElement & SVGElement>(null) 

function drawDice() {
    const svgElement = svg.value!

    d3.select(svgElement)
    .select('#dice')
    .remove()

    const enter =
        d3.select(svgElement)
        .append('g')
            .attr('id', 'dice')
            .classed('dice', true)
        .selectAll()
            .data(model.value.map((x, i) => [x, i]))
            .enter()

    enter
    .append('image')
        .attr('x', x => x[1] * 40)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 40)
    .attr('href', x => diceToIcon(x[0]))
}
watch(model, () => drawDice())
onMounted(drawDice)
</script>

<template>
    <svg ref="svg" viewBox="0 0 80 40" @click="rollDice"/>
</template>
