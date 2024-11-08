<script setup lang="ts">
import { type OpenTradeOffer, type Color } from 'shared';
import TradeOverview from './TradeOverview.vue';

defineProps<{ 
    offer: OpenTradeOffer
    canAccept: boolean
    ownColor: Color
}>()
defineEmits<{
    accept: []
    reject: []
}>()
</script>

<template>
<TradeOverview 
    :to-give-away="offer.desiredCards" 
    :to-collect="offer.offeredCards"
    :others="offer.otherColors.filter(x => x.color != ownColor).map(x => { return { ...x, enabled: false } })">
    <div class="buttons">
        <button @click="() => $emit('accept')" :disabled="!canAccept">accept</button>
        <button @click="() => $emit('reject')">reject</button>
    </div>
</TradeOverview>
</template>

<style scoped>
.buttons {
    display: flex;
}
</style>