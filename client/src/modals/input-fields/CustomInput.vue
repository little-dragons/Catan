<script setup lang="ts">
import { computed, ref, triggerRef, watch, type Ref } from 'vue';
import ErrorImg from './ErrorImg.vue';
import ErrorText from './ErrorText.vue';

const props = withDefaults(defineProps<{
    tagId?: string,
    type: 'text' | 'password',
    rules: ((current: string) => true | string)[]
    disabled?: boolean,
}>(), { disabled: false })
defineOptions({
    inheritAttrs: false
})

const rawInput = ref("")

const validityStatus = computed(() => {
    if (rawInput.value === "")
        return 'This field is not optional' as const
    
    for (const rule of props.rules) {
        const result = rule(rawInput.value)
        if (result != true)
            return result
    }

    return true
})


const result = computed(() => {
    if (validityStatus.value == true)
        return rawInput.value
    else
        return null
})

defineExpose({
    reevaluate: () => triggerRef(rawInput),
    result: result
})

</script>
<template>
    <div>
        <div class="input-container" :class="disabled ? 'disabled' : ''">
            <input :id="tagId" :type="type" v-model="rawInput" spellcheck="false" :disabled="disabled" v-bind="$attrs"/>
            <ErrorImg :status="validityStatus"/>
        </div>
        <ErrorText :status="validityStatus"/>
    </div>
</template>

<style scoped>
.input-container {
    border-bottom: 1px solid black;
    display: flex;
    flex-direction: row;
    align-self: end;
    background-color: white;
}

.disabled {
    color: gray;
}

input:focus {
    outline: none;
}
.input-container:focus-within {
    outline: 1px solid black;
}
input {
    border: none;
    display: inline-block;
    width: calc(100% - 1rem);
    padding-bottom: 0;
}
input:disabled {
    background-color: inherit;
    color: inherit;
}
</style>