<script setup lang="ts">
import oneDie from '@/assets/dice/one-die.svg'
import twoDie from '@/assets/dice/two-die.svg'
import threeDie from '@/assets/dice/three-die.svg'
import fourDie from '@/assets/dice/four-die.svg'
import fiveDie from '@/assets/dice/five-die.svg'
import sixDie from '@/assets/dice/six-die.svg'
import type { DieResult } from 'shared'

function diceToIcon(die: DieResult): string {
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
}

defineEmits(['diceClicked'])

defineProps<{ 
    dice: readonly [DieResult, DieResult]
    enabled: boolean
}>()
</script>

<template>
    <svg ref="svg" viewBox="0 0 80 40" @click="() => { if (enabled) $emit('diceClicked') }" :class="enabled ? 'animation' : ''">
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

<style scoped>
@keyframes resize {
    0% { transform: scale(0.85); }
    50% { transform: scale(1.15); }
    100% { transform: scale(0.85); }
}
@keyframes setup {
    from { transform: scale(1); }
    to { transform: scale(0.85); }
}

.animation {
    animation: setup 1s 1, resize 2.5s infinite 1s;
}
.animation:hover {
    cursor: pointer;
}
</style>