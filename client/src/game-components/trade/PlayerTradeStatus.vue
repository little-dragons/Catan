<script setup lang="ts">
import { type Color, TradeStatusByColor } from 'shared';
import Accepting from '@/assets/ui/ok.svg'
import Rejecting from '@/assets/ui/error.svg'
import Undecided from '@/assets/ui/questionmark.svg'
import PlayerIcon from '../PlayerIcon.vue';

defineProps<{
    color: Color
    status: TradeStatusByColor
    icon: string
    enabled: boolean
}>()

defineEmits<{
    statusClicked: []
}>()

function iconForStatus(status: TradeStatusByColor) {
    switch (status) {
        case TradeStatusByColor.Accepting: 
            return Accepting 
        case TradeStatusByColor.Rejecting: 
            return Rejecting
        case TradeStatusByColor.Undecided: 
            return Undecided
    }
}
</script>

<template>
<div class="top">
    <PlayerIcon class="icon" :color="color" :icon="icon"/>
    <button 
        @click="() => enabled ? $emit('statusClicked') : ''"
        class="status"            
        :disabled="!enabled">
            <img :src="iconForStatus(status)"/>
    </button>
</div>
</template>

<style scoped>
.top {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.icon {
    height: 50%;
    z-index: 1;
}

button {
    display: block;
    margin-top: -10%;
    height: 50%;
    padding-top: 3px;
    object-fit: scale-down;
    box-sizing: border-box;
    border: 1px solid black;
    border-radius: 2px;
}
button > img {
    height: 100%;
}
button:disabled {
    background-color: rgba(86, 51, 51, 0.152);
}
button:not(:disabled) {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    background: linear-gradient(215deg, #f5f5f5, #d7d7d7);
}
button:not(:disabled):hover {
    cursor: pointer;
}
</style>