<script setup lang="ts">
import error from '@/assets/ui/error.svg'
import ok from '@/assets/ui/ok.svg'


defineProps<{
    /**
     * True indicates that everything is good, false shows an error but without a message,
     * and string shows the specified error string (in addition to the error image)
     */
    status: true | false | string
}>()

</script>

<template>
    <img :src="error" v-if="status != true" :title="status === false ? 'This input group is invalid' : status">
    <img :src="ok" v-if="status == true" title="Everything is good!">
</template>

<style scoped>

img {
    /* TODO make image non-draggable */
    user-select: none;
    width: 1rem;
    height: 1rem;
    margin: 2px;
}
</style>