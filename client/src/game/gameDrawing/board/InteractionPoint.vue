<script setup lang="ts">
const props = defineProps<{
    position: [number, number]
    minRadius: number
}>()


// These values exist to solely to make it clear to vue that there is no reactivity in here.
// If, in the animate-elements, a reactive value is used, the built-in animation does not work.
const minR = props.minRadius
const maxR = props.minRadius * 1.3
</script>

<template>
    <circle
        :cx="props.position[0]"
        :cy="props.position[1]"
        :r="minR"
        role="button"
        aria-pressed="false"
        tabindex="1">
        <animate 
            attributeName="r"
            :values="`${minR}; ${maxR}; ${minR}`"
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