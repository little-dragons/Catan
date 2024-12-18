<script setup lang="ts">
import { countDevCards, DevCardType } from 'shared';
import { type CardStackProps } from './CardStack.vue';
import HorizontalCardStacks from './HorizontalCardStacks.vue';
import { computed } from 'vue';
import { imageForDevCard } from '@/misc/CardTextures';

defineEmits<{
    devCardClicked: [type: DevCardType]
}>()
const props = defineProps<{ cards: readonly DevCardType[] }>()

type DevCardsStack = CardStackProps & { card: DevCardType }

const stacks = computed<DevCardsStack[]>(() => {
    return Array.from(countDevCards(props.cards))
        .filter(x => x[1] != 0)
        .map(([card, count]) => {
            return {
                title: `${DevCardType[card]} (x${count})`,
                count,
                imgSrc: imageForDevCard(card),
                card
            }
        })
})
</script>

<template>
    <HorizontalCardStacks :items="stacks" @clicked="stack => $emit('devCardClicked', stack.card)"/>
</template>
