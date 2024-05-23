<script setup lang="ts">
const props = withDefaults(defineProps<{
    label: string,
    type: 'space between' | 'tight'
}>(), {
    type: 'space between'
})

const cssClass = 
    props.type == 'space between' ? 'spaceBetween' :
    props.type == 'tight' ? 'tight' : undefined!

</script>

<template>    
    <label :class="cssClass">
        <span>{{ props.label }}</span>
        <slot/>
    </label>
</template>


<style scoped>

label {
    display: flex;
    flex-direction: row;
}

.spaceBetween {
    justify-content: space-between;
}
.spaceBetween:deep(:not(span)) {
    max-width: 6rem;
}
.tight {
    justify-content: stretch;
}

label > span {
    white-space: nowrap;
}

</style>