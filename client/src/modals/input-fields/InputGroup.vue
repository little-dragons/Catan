<script setup lang="ts">
import ErrorImg from './ErrorImg.vue';
import ErrorText from './ErrorText.vue';

defineProps<{
    title: string
    /**
     * True indicates that everything is good, false shows an error but without a message,
     * and string shows the specified error string (in addition to the error image)
     */
    status: true | false | string
}>()

</script>

<template>
    <fieldset>
        <legend>
            <span>{{ title }}
                <ErrorImg :status="status"/>
            </span>
        </legend>
        <ErrorText :status="status"/>
        <slot/>
    </fieldset>
</template>

<style scoped>
fieldset {
    box-sizing: border-box;
    width: 100%;
}
</style>
