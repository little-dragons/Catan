<script setup lang="ts">
import oneDie from '@/assets/dice/one-die.svg'
import twoDie from '@/assets/dice/two-die.svg'
import threeDie from '@/assets/dice/three-die.svg'
import fourDie from '@/assets/dice/four-die.svg'
import fiveDie from '@/assets/dice/five-die.svg'
import sixDie from '@/assets/dice/six-die.svg'

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

defineEmits(['diceClicked'])

defineProps<{ dice: [number, number] }>()
</script>

<template>
    <svg ref="svg" viewBox="0 0 80 40" @click="() => $emit('diceClicked')">
        <image
            x="0"
            y="0"
            width="40"
            height="40"
            :href="diceToIcon(dice[0])"/>
        <image
            x="40"
            y="0"
            width="40"
            height="40"
            :href="diceToIcon(dice[1])"/>
    </svg>
</template>
