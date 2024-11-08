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
    <img 
        :src="iconForStatus(status)" 
        class="status" 
        @click="() => enabled ? $emit('statusClicked') : ''"
        :class="enabled ? 'hoverable' : ''"/>
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
.hoverable:hover {
    cursor: pointer;
}

.status {
    margin-top: -10%;
    height: 50%;
    background-color: rgba(86, 51, 51, 0.152);
    border: 1px solid black;
    border-radius: 2px;
    padding-top: 3px;
    object-fit: scale-down;
    box-sizing: border-box;
}
</style>