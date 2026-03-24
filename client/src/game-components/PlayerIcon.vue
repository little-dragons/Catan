<script setup lang="ts">
import { type Color, cssColor } from 'catan-shared';

defineProps<{
    color: Color
    icon?: string
}>()
</script>

<template>
<img :style="{ outlineColor: cssColor(color) }" :src="icon ?? 'https://upload.wikimedia.org/wikipedia/commons/0/0c/250227nanami.jpg'"/>
</template>

<style scoped>
img {
    border: 2px solid white;
    outline-style: solid;
    outline-width: 4%;
    border-radius: 50%;
}
</style>