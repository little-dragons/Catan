<script setup lang="ts">
import { validUsername } from 'shared';
import { computed, ref, watch } from 'vue';
import error from '@/assets/Error.svg'
import ok from '@/assets/Ok.svg'

const props = defineProps<{
    id?: string,
    type: 'username' | 'password'
}>()

const rawInputType =
    props.type == 'username' ? 'text' :
        props.type == 'password' ? 'password' :
            'text'

const model = defineModel<string | null>({ required: true, default: null })
const rawInput = ref("")

const validityStatus = computed(() => {
    if (rawInput.value == "")
        return 'empty'
    else if (props.type == 'username' && validUsername(rawInput.value))
        return true
    else if (props.type == 'username')
        return 'The username does not meet the criteria'
    else
        return 'This is an implementation error'
})

watch(rawInput, newRaw => {
    if (validityStatus.value == true)
        model.value = newRaw
    else
        model.value = null
})

</script>
<template>
    <div class="container">
        <div class="input-container">
            <input :id="$props.id" :type="rawInputType" v-model="rawInput" spellcheck="false"/>
            <img :src="error" v-if="validityStatus != true && validityStatus != 'empty'" :title="validityStatus">
            <img :src="ok" v-if="validityStatus == true" title="Everything is good!">
        </div>
        <p v-if="validityStatus != true && validityStatus != 'empty'"> {{ validityStatus }}</p>
    </div>
</template>

<style scoped>
p {
    color: #ff3333;
    font-size: x-small;
    line-height: 0.8rem;
}

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
</style>