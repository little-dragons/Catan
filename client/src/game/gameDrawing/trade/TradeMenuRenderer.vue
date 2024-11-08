<script setup lang="ts">
import { allResources, Resource } from 'shared';
import CardsRenderer from './../CardsRenderer.vue';
import { imageForResource } from '@/misc/CardTextures';

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
<div class="top default-game-ui-props">        
    <div class="left">
        <div class="desired">
            <div class="desiredButtons">
                <img 
                    v-for="res in allResources" 
                    :src="imageForResource(res)"
                    @click="() => $emit('addDesiredCard', res)"
                    class="desiredResource"/>
            </div>
            <CardsRenderer class="cardsRendererDesired" :cards="desiredCards" @resourceClicked="resource => $emit('removeDesiredCard', resource)"/>
        </div>
        <CardsRenderer class="cardsRendererOffered" :cards="offeredCards" @resourceClicked="resource => $emit('removeOfferedCard', resource)"/>
    </div>
    <div class="right">
        <button @click="() => $emit('tradeWithPlayer')" :disabled="!validOffer">Trade with player</button>
        <button @click="() => $emit('tradeWithBank')" :disabled="!canTradeWithBank">Trade with bank</button>
    </div>
</div>
</template>

<style scoped>
@import '../../../assets/base.css';

.top {
    display: flex;
    flex-direction: row;
    padding: 5px;
    border-radius: 9px;
    z-index: 1000;
}
.left {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.desiredButtons {
    margin-bottom: 10px;
    box-sizing: border-box;
}
.desiredButtons > * {
    height: 40px;
    user-select: none;
    cursor: pointer;
    margin-right: 4px;
}
.desired {
    height: 55%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
}
.cardsRendererDesired {
    height: calc(30 / 55 * 100%);
}
.cardsRendererOffered {
    height: 30%;
}

.right {
    display: flex;
    flex-direction: column;
    padding: 15px;
    justify-content: space-evenly;
}
</style>