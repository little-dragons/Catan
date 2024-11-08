<script setup lang="ts">
import { cssColor, Color, type OpenTradeOffer, TradeStatusByColor } from 'shared';
import TradeOverview from './TradeOverview.vue';
import PlayerTradeStatus from './PlayerTradeStatus.vue';

defineProps<OpenTradeOffer>()
defineEmits<{
    abort: []
    accept: [Color]
}>()
</script>

<template>
<TradeOverview 
    :to-give-away="offeredCards" 
    :to-collect="desiredCards"
    :others="otherColors.map(x => { return { color: x.color, enabled: x.status == TradeStatusByColor.Accepting, status: x.status} })"
    @accept-color="color => $emit('accept', color)">
    <div class="buttons">
        <button @click="() => $emit('abort')">abort</button>
    </div>
</TradeOverview>
</template>

<style scoped>
.buttons > button {
    display: inline;
    float: right;
    margin-top: 4px;
}
</style>