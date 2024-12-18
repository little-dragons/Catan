<script setup lang="ts">
import type { CardList, Resource } from 'shared'
import ResourceCardsRenderer from './cards/ResourceCardsRenderer.vue'
import { computed } from 'vue'
import ok from '@/assets/ui/ok.svg'
import error from '@/assets/ui/error.svg'

export type DiscardMenuRendererProps = {
    discardingCards: CardList
    expectedDiscardingCount: number
}
const props = defineProps<DiscardMenuRendererProps>()
defineEmits<{
    discard: []
    removeDiscardingCard: [card: Resource]
}>()

const diff = computed(() => props.discardingCards.length - props.expectedDiscardingCount)
</script>

<template>
<div class="top default-game-ui-props">
    <div class="text">
        <p>
            You have to discard {{ expectedDiscardingCount }} cards ({{ diff == 0 ? "correct amount" : diff > 0 ? `${diff} too many` : `${-diff} too few` }}).
        </p>
    </div>
    <div class="actions">
        <ResourceCardsRenderer class="cards" :cards="discardingCards" @resourceClicked="res => $emit('removeDiscardingCard', res)"/>
        <div class="right">
            <button @click="() => $emit('discard')" :disabled="diff != 0" title="Discard selected cards">
                <img :src="diff == 0 ? ok : error"/>
            </button>
        </div>
    </div>
</div>
</template>

<style scoped>
@import '../../assets/base.css';

.top {
    padding: 5px;
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 5px;
}

.text > p {
    margin: 0;
    margin-bottom: 3px;
}

.actions { 
    display: flex;
    flex-direction: row;
    height: 70%;
    align-items: center;
}
.cards {
    height: 100%;
}

.right {
    margin: 0 1px 0 6px;
}

.right > * > img {
    height: 20px;
    width: 20px;
}

.right > button:not(:disabled):hover {
    cursor: pointer;
}
.right > button:disabled:hover {
    cursor: not-allowed;
}
</style>