<script setup lang="ts">
import { Resource } from 'shared';

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
const props = defineProps<{ cards: Resource[] }>()

function count(res: Resource) {
    return props.cards.filter(x => x == res).length
}

</script>

<template>
    <div class="container">
        <div v-for="resource in [Resource.Lumber, Resource.Brick, Resource.Wool, Resource.Grain, Resource.Ore]" class="stack" @click="() => $emit('resourceClicked', resource)">
            <img v-if="count(resource) < 8" v-for="_ in Array(count(resource)).keys()" 
                :src="imageForResource(resource)"/>
               
            <img v-if="count(resource) >= 8" :src="imageForResource(resource)"/>
            <img v-if="count(resource) >= 8" class="tighter" :src="imageForResource(resource)"/>
            <img v-if="count(resource) >= 8" class="tighter" :src="imageForResource(resource)"/>
            <img v-if="count(resource) >= 8" class="tighter" :src="imageForResource(resource)"/>
            <img v-if="count(resource) >= 8" class="tighter" :src="imageForResource(resource)"/>
            <div v-if="count(resource) >= 8" class="card-counter"><span>{{ count(resource) }}</span></div>
        </div>
    </div>
</template>

<style scoped>
@import '../../assets/base.css';

.container {
    border: 1px solid black;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    padding: 5px;
    height: fit-content;
}

.stack {
    position: relative;
    height: 4rem;
    display: flex;
    flex-direction: row-reverse;
}
.stack:not(:empty) {
    margin-left: 5px;
}

img {
    height: inherit;
    position: relative;
    user-select: none;
}
img:not(:first-child) {
    margin-right: -1.9rem;
}
.tighter {
    margin-right: -2.4rem !important;
}
img:hover {
    cursor: pointer;
}

.card-counter {
    position: absolute;
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