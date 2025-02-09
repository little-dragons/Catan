<script setup lang="ts">
import { countResources, Resource, type CardList } from 'shared';
import { imageForResource } from '@/misc/CardTextures';
import { type CardStackProps } from './CardStack.vue';
import HorizontalCardStacks from './HorizontalCardStacks.vue';
import { computed } from 'vue';

defineEmits<{
    resourceClicked: [res: Resource]
}>()
const props = defineProps<{ cards: CardList }>()

type ResourceStack = CardStackProps & { res: Resource }

const stacks = computed<ResourceStack[]>(() => {
    return Array.from(countResources(props.cards))
        .filter(x => x[1] != 0)
        .map(([res, count]) => {
            return {
                title: `${Resource[res]} (x${count})`,
                count,
                imgSrc: imageForResource(res),
                res
            }
        })
})
</script>

<template>
    <HorizontalCardStacks :items="stacks" @clicked="stack => $emit('resourceClicked', stack.res)"/>
</template>
