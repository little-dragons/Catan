<script setup lang="ts">
import { countResources, Resource, type CardList } from 'shared';

import brickCard from '@/assets/resource-cards/brick-card.svg'
import grainCard from '@/assets/resource-cards/grain-card.svg'
import lumberCard from '@/assets/resource-cards/lumber-card.svg'
import oreCard from '@/assets/resource-cards/ore-card.svg'
import woolCard from '@/assets/resource-cards/wool-card.svg'

function imageForResource(res: Resource): string {
    switch (res) {
        case Resource.Grain: return grainCard;
        case Resource.Ore: return oreCard;
        case Resource.Wool: return woolCard;
        case Resource.Lumber: return lumberCard;
        case Resource.Brick: return brickCard;
    }
}

defineEmits<{
    resourceClicked: [res: Resource]
}>()
defineProps<{ cards: CardList }>()

</script>

<template>
    <div class="container">
        <div v-for="[res, count] in Array.from(countResources(cards).entries()).filter(([_, count]) => count != 0)" class="stack" @click="() => $emit('resourceClicked', res)">
            <img v-if="count < 8" v-for="_ in Array(count)" 
                :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
               
            <img v-if="count >= 8" :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
            <img v-if="count >= 8" class="tighter" :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
            <img v-if="count >= 8" class="tighter" :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
            <img v-if="count >= 8" class="tighter" :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
            <img v-if="count >= 8" class="tighter" :src="imageForResource(res)" :title="`${Resource[res]} (x${count})`"/>
            <div v-if="count >= 8" class="card-counter"><span>{{ count }}</span></div>
        </div>
    </div>
</template>

<style scoped>
@import '../../assets/base.css';


.container {
    border: 1px solid black;
    border-radius: 2px;
    display: flex;
    flex-direction: column-reverse;
    box-sizing: border-box;
    height: 100%;
    padding: 0;
    width: 100%;
    background-color: white;
    /*
    This is a dirty trick to change the layout calcuation: Usually, 
    percentages apply to the width of the containing element,
    but as the stack height is the same for each card, and the 
    stack width is not, the height is better for layouting.
    Changing the writing mode, changes the layout calculation,
    and makes the height the basis for percentage calculation.
    This also reverses column and row for flex-direction.
    */
    writing-mode: vertical-rl;
}


.stack {
    /* Remember that these percentages are in relation to the container's height,
    and the flex-direction is reversed (see writing-mode) */
    --stack-margin: 6.3%;
    position: relative;
    display: flex;
    flex-direction: column;
    margin: var(--stack-margin);
    margin-right: 0;
    height: calc(100% - var(--stack-margin));
}
.stack:last-child {
    margin-right: var(--stack-margin);
}

img {
    height: inherit;
    position: relative;
    user-select: none;
}
img:not(:first-child) {
    margin-right: -45%;
}
.tighter {
    margin-right: -55% !important;
}
img:hover {
    cursor: pointer;
}

.card-counter {
    position: absolute;
    writing-mode: horizontal-tb;
    font-size: xx-large;
    color: rgb(255, 255, 255);
    text-shadow: 2px 2px black;
    background-image: radial-gradient(rgba(0, 0, 0, 0.608) 50%, transparent 100%);
    text-align: center;
    align-self: center;
    user-select: none;
    width: 100%;
    height: 100%;
    margin: auto;
}
span {
    position: relative;
    top: 0.5rem;
}
.card-counter:hover {
    cursor: pointer;
}



</style>