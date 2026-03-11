<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import error from '@/assets/ui/error.svg'
import ok from '@/assets/ui/ok.svg'

const numRegex = /^\d+$/

const props = withDefaults(defineProps<{
    tagId?: string,
    rules: ((current: number) => true | string)[]
    disabled?: boolean,
}>(), { disabled: false })
defineOptions({
    inheritAttrs: false
})

const model = defineModel<number | undefined>({ required: true })

const rawInput = ref(model.value == undefined ? "" : String(model.value))

const validityStatus = computed(() => {
    if (rawInput.value === "")
        return 'This field is not optional' as const
    
    if (!numRegex.test(rawInput.value))
        return 'Not an integer' as const
    const num = Number(rawInput.value)
    for (const rule of props.rules) {
        const result = rule(num)
        if (result != true)
            return result
    }
    return true
})


watchEffect(() => {
    if (validityStatus.value == true)
        model.value = Number(rawInput.value)
    else
        model.value = undefined
})

</script>
<template>
    <div>
        <div class="input-container" :class="disabled ? 'disabled' : ''">
            <input :id="tagId" type="number" v-model="rawInput" spellcheck="false" :disabled="disabled" v-bind="$attrs"/>
            <img :src="error" v-if="validityStatus != true && validityStatus != null" :title="validityStatus">
            <img :src="ok" v-if="validityStatus == true" title="Everything is good!">
        </div>
        <p v-if="validityStatus != true && validityStatus != null"> {{ validityStatus }}</p>
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

img {
    /* TODO make image non-draggable */
    user-select: none;
    width: 1rem;
    height: 1rem;
    margin: 2px;
}

p {
    color: #ff3333;
    font-size: x-small;
    line-height: 0.8rem;
}
</style>