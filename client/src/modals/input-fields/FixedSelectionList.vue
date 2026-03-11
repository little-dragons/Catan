<script setup lang="ts" generic="T extends string | number | symbol">

const props = defineProps<{
    keys: readonly T[]
    strings: (val: T) => string
    highlightIdx?: number
}>()
const model = defineModel<T[]>()

</script>

<template>
    <div class="top">        
        <div v-for="i in model!.keys()">
            <select v-model="model![i]" :class="i == highlightIdx ? 'highlight' : ''">
                <option v-for="key of keys" :value="key">{{strings(key)}}</option>
            </select>
            
        </div>
    </div>
</template>

<style scoped>

.highlight {
    background-color: rgba(213, 55, 55, 0.63);
}

.top {
    display: flex;
    flex-wrap: wrap;
    width: inherit;
    max-width: inherit;
}
</style>