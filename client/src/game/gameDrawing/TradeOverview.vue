<script setup lang="ts">
import type { CardList } from 'shared';
import GreenArrow from '@/assets/ui/greenarrow.svg'
import RedArrow from '@/assets/ui/redarrow.svg'
import CardsRenderer from './CardsRenderer.vue';

defineProps<{
    toGiveAway: CardList
    toCollect: CardList
}>()
</script>

<template>
<div class="default-game-ui-props tradeBox">
    <div class="left">
        <div class="top">
            <img :src="RedArrow"/>
            <CardsRenderer :cards="toGiveAway"/>
        </div>
        <div class="bottom">
            <img :src="GreenArrow"/>
            <CardsRenderer :cards="toCollect"/>
        </div>
    </div>
    <div>
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
}

.left {
    min-width: 5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-right: 0.3rem;
}
.left > div {
    height: 20px;
    display: flex;
}
.left > div > img {
    height: inherit;
}

</style>