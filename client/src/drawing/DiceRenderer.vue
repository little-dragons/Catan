<script setup lang="ts">
import * as d3 from 'd3';
import { onMounted, ref, watch, type Ref } from 'vue';
import oneDie from '@/assets/dice/one-die.svg'
import twoDie from '@/assets/dice/two-die.svg'
import threeDie from '@/assets/dice/three-die.svg'
import fourDie from '@/assets/dice/four-die.svg'
import fiveDie from '@/assets/dice/five-die.svg'
import sixDie from '@/assets/dice/six-die.svg'
import { gameSocket, lobbySocket, roomSocket } from '@/socketWrapper/Socket';
import { currentAuthUser } from '@/socketWrapper/Login';
import { currentRoom } from '@/socketWrapper/Room';


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
const props = defineProps<{
    dice: Ref<[number, number]>
}>()

const svg = ref<null | HTMLElement & SVGElement>(null) 

async function clickHandler() {
    //TODO
    await lobbySocket.emitWithAck('startGame', currentRoom.value!.id, currentAuthUser.value!.authToken)
    await gameSocket.emitWithAck('rollDice', currentRoom.value!.id, currentAuthUser.value!.authToken)
}

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
            .data(props.dice.value.map((x, i) => [x, i]))
            .enter()

    enter
    .append('image')
        .attr('x', x => x[1] * 40)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 40)
    .attr('href', x => diceToIcon(x[0]))
}
watch(props.dice, () => drawDice())
onMounted(drawDice)
</script>

<template>
    <svg ref="svg" viewBox="0 0 80 40" @click="clickHandler"/>
</template>
