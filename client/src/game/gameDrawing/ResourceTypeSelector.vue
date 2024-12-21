<script setup lang="ts">
import { type CardList, Resource, allResources, tryRemoveCard } from 'shared'
import ResourceCardsRenderer from './cards/ResourceCardsRenderer.vue'
import { computed, ref } from 'vue'
import { imageForResource } from '@/misc/CardTextures'
import ok from '@/assets/ui/ok.svg'
import error from '@/assets/ui/error.svg'

defineEmits<{
    selected: [resources: Resource],
    abort: []
}>()
const chosen = ref<Resource | undefined>(undefined)

</script>

<template>
<div class="top default-game-ui-props">
    <div>
        <div class="text">
            <p>
                You have to select a resource.
            </p>
        </div>    
        <div class="choosingButtons">
            <button
                v-for="res in allResources"
                @click="() => chosen = res"
                :title="Resource[res]"
                :class="chosen == res ? 'selected' : ''">
                <img :src="imageForResource(res)" :title="Resource[res]"/>
            </button>
        </div>
    </div>
    <div class="actions">
        <button @click="() => { if (chosen != undefined) $emit('selected', chosen) }" :disabled="chosen == undefined" title="Choose selected resource">
            Select
        </button>
        
        <button @click="() => $emit('abort')"  title="Abort selection">
            Abort
        </button>
    </div>
</div>
</template>

<style scoped>
@import '../../assets/base.css';

.top {
    padding: 5px;
    display: flex;
    flex-direction: row;
    height: 100%;
    border-radius: 5px;
}
.top > * {
    height: 100%;
}

.text > p {
    margin: 0;
    margin-bottom: 3px;
    height: 20%;
}

.choosingButtons {
    height: 60%;
}
.choosingButtons > * {
    height: 100%;
    border: none;
    background: none;
    padding: 0;
    margin-right: 10px;
}
.choosingButtons > * > * {
    height: 100%;
}
.selected {
    border: 3px solid rgba(0, 0, 0, 0.613);
    border-radius: 2px;
}

.actions { 
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    align-items: end;
}
.actions > * {
    width: 100%;
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