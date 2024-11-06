<script setup lang="ts">
import { Resource } from 'shared';
import CardsRenderer from './CardsRenderer.vue';

export type TradeMenuRendererProps = {
    offeredCards: readonly Resource[]
    desiredCards: readonly Resource[]
    validOffer: boolean
    canTradeWithBank: boolean
}
defineProps<TradeMenuRendererProps>()
defineEmits<{
    tradeWithPlayer: []
    tradeWithBank: []
    addDesiredCard: [card: Resource]
    removeDesiredCard: [card: Resource]
    removeOfferedCard: [card: Resource]
}>()

</script>

<template>
    <div>
        <div>
            <button @click="() => $emit('addDesiredCard', Resource.Wool)">Wool</button>
            <button @click="() => $emit('addDesiredCard', Resource.Grain)">Grain</button>
            <button @click="() => $emit('addDesiredCard', Resource.Brick)">Brick</button>
            <button @click="() => $emit('addDesiredCard', Resource.Lumber)">Lumber</button>
            <button @click="() => $emit('addDesiredCard', Resource.Ore)">Ore</button>
        </div>
        <CardsRenderer :cards="desiredCards" @resourceClicked="resource => $emit('removeDesiredCard', resource)"/>
        <CardsRenderer :cards="offeredCards" @resourceClicked="resource => $emit('removeOfferedCard', resource)"/>
    </div>
    <div>
        <button @click="() => $emit('tradeWithPlayer')" :disabled="!validOffer">Trade with player</button>
        <button @click="() => $emit('tradeWithBank')" :disabled="!canTradeWithBank">Trade with bank</button>
    </div>
</template>

<style scoped>

</style>