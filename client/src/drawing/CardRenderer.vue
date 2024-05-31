<script setup lang="ts">
import { Resource } from 'shared';
import { computed, ref, watch } from 'vue';

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

const props = defineProps<{ cards: Resource[] }>()
const counted = ref<Map<Resource, number>>(undefined!)
watch(props, ({ cards }) => {
    const map = new Map<Resource, number>()
    for (const card of cards)
        map.set(card, (map.get(card) ?? 0) + 1)
    counted.value = map
}, { immediate: true })

</script>

<template>
    <div class="container">
        <div v-for="resource in [Resource.Lumber, Resource.Brick, Resource.Wool, Resource.Grain, Resource.Ore]" class="stack">
            <img 
                v-for="i in Array($props.cards.filter(x => x == resource).length).keys()" 
                :src="imageForResource(resource)"
                />
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

.stack > img {
    height: inherit;
    position: relative;
}
.stack > img:last-child {
    margin-left: 5px;
}
.stack > img:not(:first-child) {
    margin-right: -20px;
}


</style>