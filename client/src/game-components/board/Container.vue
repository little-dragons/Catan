<script setup lang="ts">
import type { Coordinate } from 'shared';
import { svgViewboxStringFromTileCoords } from './Layout';

defineProps<{
    tileCoordinates: Coordinate[]
}>()

</script>

<template>
    <svg :viewBox="svgViewboxStringFromTileCoords(tileCoordinates)">
        <slot/>
    </svg>
</template>



<style scoped>
svg {
    max-height: 100%;
    max-width: 100%;
    margin: auto;
}
</style>
