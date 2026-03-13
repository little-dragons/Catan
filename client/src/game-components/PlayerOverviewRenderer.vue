<script setup lang="ts">
import { type Color, type OpenTradeOffer } from 'catan-shared';
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
    knightsPlayed: number
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
                <abbr :title="`${victoryPoints} Victory Points`">{{ victoryPoints }} <div>vp</div></abbr>
                <abbr :title="`${handCardsCount} Hand cards`">{{ handCardsCount }} <div>hc</div></abbr>
                <abbr :title="`${devCardsCount} Development cards`">{{ devCardsCount }} <div>dc</div></abbr>
                <abbr :title="`${knightsPlayed} Knights played`">{{ knightsPlayed }} <div>kp</div></abbr>
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
    margin-top: 4px;
    margin-left: 30px;
    height: min-content;
    column-gap: 2px;
    row-gap: 2px;
    align-items: center;
    grid-template-columns: auto auto auto;
    grid-template-rows: 50% 50%;
}

/** Note that with the small caps font, the letters written in here are actually lowercase.
 *  The numbers with this font use the same height as the non-capital letters so it looks nice.
 */
.grid > * {
    font-family: "Sedan SC", serif;
    display: block;
    text-align: end;
    border: var(--mute-border);
    border-radius: 2px;
    padding: 1px;
    background-color: rgba(255, 255, 255, 0.62);
    user-select: none;
}
.grid > * > * {
    display: inline;
}
abbr[title] {
    cursor: help;
    text-decoration: none;
}
</style>