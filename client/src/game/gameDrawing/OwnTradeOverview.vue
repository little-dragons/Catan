<script setup lang="ts">
import { cssColor, Color, type OpenTradeOffer } from 'shared';
import TradeOverview from './TradeOverview.vue';

defineProps<OpenTradeOffer>()
defineEmits<{
    abort: []
    accept: [Color]
}>()
</script>

<template>
<TradeOverview :to-give-away="offeredCards" :to-collect="desiredCards">
    <div>
        <div class="others">
            <button 
                v-for="other in otherColors" 
                :style="{ backgroundColor: cssColor(other.color) }"
                @click="() => $emit('accept', other.color)">{{ Color[other.color] }}</button>
        </div>
        <div class="buttons">
            <button @click="() => $emit('abort')">abort</button>
        </div>
    </div>
</TradeOverview>
</template>

<style scoped>
.buttons > button {
    display: inline;
}

.others {

}
</style>