<script setup lang="ts" generic="ItemType extends CardStackProps">
import CardStack, { type CardStackProps } from './CardStack.vue';

defineEmits<{
    clicked: [item: ItemType]
}>()
defineProps<{ items: readonly ItemType[] }>()

</script>

<template>
    <div class="container">
        <CardStack
            v-for="item of items"
            v-bind="item"
            @clicked="() => $emit('clicked', item)"
        />
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
    padding: 0;
    width: 100%;
    background-color: white;

    /* Explanation in CardStack */
    writing-mode: vertical-rl;
}



</style>