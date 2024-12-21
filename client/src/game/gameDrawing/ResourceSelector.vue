<script setup lang="ts">
import { type CardList, Resource, allResources, tryRemoveCard } from 'shared'
import ResourceCardsRenderer from './cards/ResourceCardsRenderer.vue'
import { computed, ref } from 'vue'
import { imageForResource } from '@/misc/CardTextures'
import ok from '@/assets/ui/ok.svg'
import error from '@/assets/ui/error.svg'

const props = defineProps<{
    count: number
}>()
defineEmits<{
    selected: [resources: CardList],
    abort: []
}>()
const chosen = ref<CardList>([])
const diff = computed(() => chosen.value.length - props.count)

</script>

<template>
<div class="top default-game-ui-props">
    <div class="text">
        <p>
            You have to select {{ count }} cards ({{ diff == 0 ? "correct amount" : diff > 0 ? `${diff} too many` : `${-diff} too few` }}).
        </p>
    </div>    
    <div class="choosingButtons">
        <button
            v-for="res in allResources"
            @click="() => chosen = [res, ...chosen]"
            :title="Resource[res]">
            <img :src="imageForResource(res)" :title="Resource[res]"/>
        </button>
    </div>
    <div class="actions">
        <ResourceCardsRenderer class="cards" :cards="chosen" @resourceClicked="res => chosen = tryRemoveCard(chosen, res) ?? chosen"/>
        <div class="right">
            <button @click="() => $emit('selected', chosen)" :disabled="diff != 0" title="Discard selected cards">
                <img :src="diff == 0 ? ok : error"/>
            </button>
            
            <button @click="() => $emit('abort')"  title="Abort selection">
                Abort
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

.choosingButtons {
    height: 30%;
}
.choosingButtons > * {
    border: none;
    background: none;
    height: 100%;
    padding: 0;
    margin-right: 10px;
}
.choosingButtons > * > * {
    height: 100%;
}

.actions { 
    display: flex;
    flex-direction: row;
    height: 70%;
    align-items: center;
}
.cards {
    height: 50%;
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