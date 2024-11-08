<script setup lang="ts">
import { type CardList, Color, type OpenTradeOffer, cssColor } from 'shared';
import TradeOverview from './TradeOverview.vue';

defineProps<OpenTradeOffer>()
defineEmits<{
    accept: []
    reject: []
}>()
</script>

<template>
<TradeOverview :to-give-away="desiredCards" :to-collect="offeredCards">
    <div>
        <div class="others">
            <div v-for="other in otherColors" :style="{ backgroundColor: cssColor(other.color) }" />
        </div>
        <div class="buttons">
            <button @click="() => $emit('accept')">accept</button>
            <button @click="() => $emit('reject')">reject</button>
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