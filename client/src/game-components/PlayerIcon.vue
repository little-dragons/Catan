<script setup lang="ts">
import { type Color, cssColor } from 'shared';

defineProps<{
    color: Color
    icon?: string
}>()
</script>

<template>
<img :style="{ outlineColor: cssColor(color) }" :src="icon ?? 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg/640px-Obama_family_dog_in_the_Rose_Garden_%28cropped%29.jpg'"/>
</template>

<style scoped>
img {
    border: 2px solid white;
    outline-style: solid;
    outline-width: 4%;
    border-radius: 50%;
}
</style>