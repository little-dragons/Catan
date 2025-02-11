<script setup lang="ts">
import { nextTick, ref } from 'vue';
import error from '@/assets/ui/error.svg';
import ok from '@/assets/ui/ok.svg';
import change from '@/assets/ui/setting.svg';

const props = defineProps<{
    name: string
    initial: string
    isValid: (newVal: string) => boolean
    update: undefined | ((newVal: string) => void) 
}>()

const editing = ref<false | string>(false)
const input = ref<null | HTMLInputElement>(null)
function sendUpdate() {
    if (editing.value == false || props.update == undefined || !props.isValid(editing.value))
        return

    props.update(editing.value)
    editing.value = false
}
function startEditing() {
    editing.value = props.initial.toString()
    nextTick(() => {
        input.value?.focus()
        input.value?.select()
    })
}
</script>

<template>
    <div v-if="editing && update != undefined" class="top">
        <span class="descriptor">{{ name }}:</span>
        <div class="right">            
            <input
                ref="input"
                type="text"
                class="value"
                v-model="editing"
                @keypress.enter="() => { if (editing != false && isValid(editing)) sendUpdate() }"
            />
            <button 
                class="edit"
                @click="sendUpdate"
                :disabled="!isValid(editing)"
                :title="isValid(editing) ? 'Apply the new value.' : 'The provided value is not allowed.'">
                <img :src="ok"/>
            </button>
            <button 
                class="edit"
                @click="() => editing = false"
                title="Discard this change.">
                <img :src="error"/>
            </button>
        </div>
    </div>

    <div v-else class="top">
        <span class="descriptor">{{ name }}:</span>
        <div class="right">            
            <span class="value">{{ initial }}</span>
            <button 
                class="edit"
                @click="startEditing"
                :disabled="update == undefined"
                :title="update == undefined ? 'You are not allowed to change this value.' : 'You can change this value.'">
                <img :src="change"/>
            </button>
        </div>
    </div>
</template>

<style scoped>
.top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 0.5rem;
}
.right {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    overflow: hidden;
    align-items: center;
}

span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
}

.descriptor {
    min-width: 5rem;
}
.value {
    justify-self: end;
    max-width: 100%;
    min-width: 1.6rem;
    text-align: end;
}
input[type=text] {
    max-width: 7rem;
}

button {
    height: 1rem;
    width: 1rem;
    padding: 0;
    flex-shrink: 0;
    display: flex;
    margin-left: 4px;
}
img {
    height: 100%;
    object-fit: cover;
}
</style>