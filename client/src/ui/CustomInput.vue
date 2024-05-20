<script setup lang="ts">
import { computed, ref, triggerRef, type Ref } from 'vue';
import error from '@/assets/ui/error.svg'
import ok from '@/assets/ui/ok.svg'

const props = defineProps<{
    tagId?: string,
    type: 'text' | 'password',
    rules: ((current: string) => true | string)[]
}>()

const rawInput = ref("")

const validityStatus = computed(() => {
    if (rawInput.value == "")
        return null
    
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
        <div class="input-container">
            <input :id="$props.tagId" :type="$props.type" v-model="rawInput" spellcheck="false"/>
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

img {
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