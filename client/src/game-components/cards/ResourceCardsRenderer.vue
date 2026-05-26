<script setup lang="ts">
import { type CardList, countResources, foldRecord, Resource } from 'catan-shared';
import { computed } from 'vue';
import { imageForResource } from '@/misc/CardTextures';
import type { CardStackProps } from './CardStack.vue';
import HorizontalCardStacks from './HorizontalCardStacks.vue';

defineEmits<{
    resourceClicked: [res: Resource]
}>()
const props = defineProps<{ cards: CardList }>()

type ResourceStack = CardStackProps & { res: Resource }

const stacks = computed<ResourceStack[]>(() => {
    return foldRecord<Resource, number, ResourceStack[]>(countResources(props.cards), (s, [k, v]) => {
        if (v === 0)
            return s

        const stack: ResourceStack = { 
            title: `${Resource[k]} (x${v})`,
            count: v,
            imgSrc: imageForResource(k),
            res: k
        }
        return [stack, ...s]
    }, [])
})
</script>

<template>
    <HorizontalCardStacks :items="stacks" @clicked="stack => $emit('resourceClicked', stack.res)"/>
</template>
