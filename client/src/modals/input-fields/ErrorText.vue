<script setup lang="ts">
defineProps<{
    /**
     * True indicates that everything is good, false shows an error but without a message,
     * and string shows the specified error string (in addition to the error image)
     */
    status: true | false | string
}>()

</script>

<template>
    <p v-if="status != true && status != false">{{ status }}</p>
</template>

<style scoped>
p {
    color: #ff3333;
    font-size: x-small;
    line-height: 0.8rem;
}
</style>