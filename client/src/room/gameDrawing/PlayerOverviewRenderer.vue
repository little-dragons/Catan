<script setup lang="ts">
import type { Color } from 'shared';
import { stringColor } from 'shared';


export type PlayerOverviewData = {
    name: string
    color: Color
    victoryPoints: number
    isGuest: boolean
}
defineProps<PlayerOverviewData>()

</script>

<template>
    <div class="top">
        <img class="picture" :style="`outline-color: ${stringColor(color)};`" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg/640px-Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg"/>
        <div class="box">
            <div class="username">{{ name }}</div>
            <div class="grid">
                <div>{{ victoryPoints }} vp</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sedan+SC&display=swap');

.picture {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid white;
    outline-style: solid;
    outline-width: 4px;
    object-fit: cover;
    top: -13px;
    left: -13px;
    z-index: 1;
}


.top {
    position: relative;
    width: 200px;
    display: flex;
    flex-direction: column;
}
.username {
    padding-left: 40px;
    background-color: white;
    border: var(--mute-border);
    border-radius: 3px;
    font-family: "Sedan SC", serif;
}
.box {
    background-color: antiquewhite;
    border: 1px solid black;
    border-radius: 10px;
    padding: 6px;
}

.grid {
    display: grid;
    margin-top: 5px;
    margin-left: 25px;
    height: 45px;
    column-gap: 5px;
    row-gap: 3px;
    grid-template-columns: 33% 33% 33%;
    grid-template-rows: 50% 50%;
}

.grid > * {
    font-family: "Sedan SC", serif;
    text-align: end;
    border: var(--mute-border);
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.62);
}
</style>