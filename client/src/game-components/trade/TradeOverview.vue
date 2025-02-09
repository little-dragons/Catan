<script setup lang="ts">
import { type CardList, Color, TradeStatusByColor } from 'shared';
import GreenArrow from '@/assets/ui/greenarrow.svg'
import RedArrow from '@/assets/ui/redarrow.svg'
import ResourceCardsRenderer from '../cards/ResourceCardsRenderer.vue';
import PlayerTradeStatus from './PlayerTradeStatus.vue';

defineProps<{
    toGiveAway: CardList
    toCollect: CardList
    others: { color: Color, status: TradeStatusByColor, enabled: boolean }[]
}>()

defineEmits<{
    acceptColor: [color: Color]
}>()
</script>

<template>
<div class="default-game-ui-props tradeBox">
    <div class="left">
        <div class="top">
            <img :src="RedArrow"/>
            <ResourceCardsRenderer :cards="toGiveAway"/>
        </div>
        <div class="bottom">
            <img :src="GreenArrow"/>
            <ResourceCardsRenderer :cards="toCollect"/>
        </div>
    </div>
    <div style="width: 100%;">
        <div class="players">
            <PlayerTradeStatus 
                v-for="other in others"
                :color="other.color"
                icon="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg/640px-Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg"
                :status="other.status"
                :enabled="other.enabled"
                @status-clicked="() => $emit('acceptColor', other.color)"
            />
        </div>
        <slot/>
    </div>
</div>
</template>

<style scoped>
@import '../../assets/base.css';

.tradeBox {
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    padding: 2px;
    height: 100%;
    width: 100%;
}

.left {
    width: max(100%, 1rem);
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-right: 0.5rem;
}
.left > div {
    height: 40%;
    display: flex;
}

.players { 
    height: 70%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-top: 5px;
    padding-right: 3px;
    box-sizing: border-box
}
</style>