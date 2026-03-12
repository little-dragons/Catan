<script setup lang="ts">
import { type Color, type OpenTradeOffer } from 'shared';
import OtherTradeOverview from './trade/OtherTradeOverview.vue';
import PlayerIcon from './PlayerIcon.vue';


export type PlayerOverviewData = {
    name: string
    color: Color
    victoryPoints: number
    handCardsCount: number
    devCardsCount: number
    isGuest: boolean
    currentPlayer: boolean
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
            <div class="username">{{ name }}<div v-if="currentPlayer" class="current-player"/></div>
            <div class="grid">
                <div>{{ victoryPoints }} vp</div>
                <div>{{ handCardsCount }} hc</div>
                <div>{{ devCardsCount }} dc</div>
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
@import '../assets/base.css';

.picture {
    position: absolute;
    width: 50px;
    height: 50px;
    top: -13px;
    left: -13px;
    z-index: 1;
}

.current-player {
    width: 0.7em;
    height: 0.7em;
    border-radius: 0.7em;
    background-color: red;
    border: 1px black solid;
    margin-right: 0.35em;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    height: 40px;
    column-gap: 5px;
    row-gap: 3px;
    align-items: center;
    grid-template-columns: auto auto auto;
    grid-template-rows: 50% 50%;
}

.grid > * {
    font-family: "Sedan SC", serif;
    text-align: end;
    border: var(--mute-border);
    border-radius: 2px;
    margin-top: -1px;
    padding: 1px;
    background-color: rgba(255, 255, 255, 0.62);
}
</style>