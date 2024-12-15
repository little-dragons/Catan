<script setup lang="ts">
import type { Color, OpenTradeOffer } from 'shared';
import OtherTradeOverview from './trade/OtherTradeOverview.vue';
import PlayerIcon from './PlayerIcon.vue';


export type PlayerOverviewData = {
    name: string
    color: Color
    victoryPoints: number
    handCardCount: number
    isGuest: boolean
    openTrades: { offer: OpenTradeOffer, canAccept: boolean, ownColor: Color }[]
}
defineProps<PlayerOverviewData>()
defineEmits<{
    acceptTrade: [trade: OpenTradeOffer]
    rejectTrade: [trade: OpenTradeOffer]
}>()

</script>

<template>
    <div class="top">
        <PlayerIcon class="picture" :color="color"/>
        <div class="box default-game-ui-props">
            <div class="username">{{ name }}</div>
            <div class="grid">
                <div>{{ victoryPoints }} vp</div>
                <div>{{ handCardCount }} hc</div>
            </div>
        </div>
        <OtherTradeOverview 
            v-for="trade in openTrades" 
            class="trade" 
            v-bind="trade"
            @accept="() => $emit('acceptTrade', trade.offer)"
            @reject="() => $emit('rejectTrade', trade.offer)"/>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sedan+SC&display=swap');
@import '../../assets/base.css';

.picture {
    position: absolute;
    width: 50px;
    height: 50px;
    top: -13px;
    left: -13px;
    z-index: 1;
}

.trade {
    height: 100px;
}

.top {
    position: relative;
    display: flex;
    flex-direction: column;
}
.username {
    padding-left: 40px;
    background-color: white;
    border: var(--mute-border);
    border-radius: 3px;
    font-family: "Sedan SC", serif;
}
.box {
    border-radius: 10px;
    padding: 6px;
    width: var(--player-overview-width);
}

.grid {
    display: grid;
    margin-top: 5px;
    margin-left: 25px;
    height: 45px;
    column-gap: 5px;
    row-gap: 3px;
    grid-template-columns: 33% 33% 33%;
    grid-template-rows: 50% 50%;
}

.grid > * {
    font-family: "Sedan SC", serif;
    text-align: end;
    border: var(--mute-border);
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.62);
}
</style>