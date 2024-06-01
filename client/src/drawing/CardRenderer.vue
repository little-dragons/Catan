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
defineProps<{ cards: Resource[] }>()
</script>

<template>
    <div class="container">
        <div v-for="resource in [Resource.Lumber, Resource.Brick, Resource.Wool, Resource.Grain, Resource.Ore]" class="stack" @click="() => $emit('resourceClicked', resource)">
            <img v-for="_ in Array($props.cards.filter(x => x == resource).length).keys()" 
                :src="imageForResource(resource)"/>
        </div>
    </div>
</template>

<style scoped>
@import '../assets/base.css';

.container {
    border: var(--mute-border);
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    padding: 5px;
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
img:hover {
    cursor: pointer;
}



</style>