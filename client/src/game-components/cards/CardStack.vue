<script setup lang="ts">

// Note that for horizontal alignment of card stacks, it is highly advised
// to adjust the writing mode.
// This is a dirty trick to change the layout calcuation: Usually, 
// percentages apply to the width of the containing element,
// but as the stack height is the same for each card, and the 
// stack width is not, the height is better for layouting.
// Changing the writing mode, changes the layout calculation,
// and makes the height the basis for percentage calculation.
// This also reverses column and row for flex-direction.
//
// HorizontalCardStacks already implements this.

defineEmits<{
    clicked: []
}>()

export type CardStackProps = { 
    title: string
    count: number
    imgSrc: string
}

defineProps<CardStackProps>()

</script>

<template>
    <button
        class="stack"
        @click="() => $emit('clicked')"
        :title="title">

        <img v-if="count < 8" v-for="_ in new Array(count)" :src="imgSrc" :title="title"/>
        
        <img v-if="count >= 8" :src="imgSrc" :title="title"/>
        <img v-if="count >= 8" class="tighter" :src="imgSrc" :title="title"/>
        <img v-if="count >= 8" class="tighter" :src="imgSrc" :title="title"/>
        <img v-if="count >= 8" class="tighter" :src="imgSrc" :title="title"/>
        <img v-if="count >= 8" class="tighter" :src="imgSrc" :title="title"/>
        <div v-if="count >= 8" class="card-counter"><span>{{ count }}</span></div>
    </button>
</template>

<style scoped>
@import '../../assets/base.css';



.stack {
    /* Remember that these percentages are in relation to the container's height,
    and the flex-direction is reversed (see writing-mode) */
    --stack-margin: 6.3%;
    position: relative;
    display: flex;
    flex-direction: column;
    margin: var(--stack-margin);
    margin-right: 0;
    height: calc(100% - 2 * var(--stack-margin));
    background: none;
    padding: 0;
    border: none;
}
.stack:last-child {
    margin-right: var(--stack-margin);
}

img {
    height: 100%;
    position: relative;
    user-select: none;
}
img:not(:first-child) {
    margin-right: -45%;
}
.tighter {
    margin-right: -55% !important;
}
img:hover {
    cursor: pointer;
}

.card-counter {
    position: absolute;
    writing-mode: horizontal-tb;
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