<script setup lang="ts">
import { maxInteractionPointRadius, minInteractionPointRadius } from './Layout';

defineProps<{
    position: [number, number]
}>()

</script>

<template>
    <circle
        :cx="position[0]"
        :cy="position[1]"
        :r="minInteractionPointRadius"
        role="button"
        aria-pressed="false"
        tabindex="1">
        <!--
            Make sure that the values given in `values` are not reactive by vue.
            If, in the animate-elements, a reactive value is used, the svg animation does not work.
        -->
        <animate 
            attributeName="r"
            :values="`${minInteractionPointRadius}; ${maxInteractionPointRadius}; ${minInteractionPointRadius}`"
            dur="4s"
            repeatCount="indefinite"
        />
    </circle>
</template>


<style scoped>
circle {
    stroke: black;
    fill: lightgray;
    opacity: .25;
}
circle:hover {
    cursor: pointer;
}
</style>