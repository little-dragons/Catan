<script setup lang="ts">
import { validUsername } from 'shared';
import CustomInput from './CustomInput.vue'
import { computed, ref } from 'vue';

defineProps<{
    tagId?: string
}>()
const child = ref<null | InstanceType<typeof CustomInput>>(null)

const disallowedNames = [] as string[]
const namesInUse = [] as string[]
const unknownNames = [] as string[]




defineExpose({
    disallowName: (name: string) => {
        disallowedNames.push(name)
        child.value?.reevaluate()
    },
    nameInUse: (name: string) => {
        namesInUse.push(name)
        child.value?.reevaluate()
    },
    nameUnknown: (name: string) => {
        unknownNames.push(name)
        child.value?.reevaluate()
    },
    result: computed(() => child.value?.result ?? null)
})

function uiMessageValidUsername(name: string) {
    switch (validUsername(name)) {
        case 'invalid tokens':
            return 'The name contains invalid tokens'
        case 'name too long':
            return 'The name is too long'
        case true:
            return true
    }
}

const rules: ((current: string) => true | string)[] = [
    x => uiMessageValidUsername(x),
    x => disallowedNames.includes(x) ? 'This username is not allowed' : true,
    x => namesInUse.includes(x) ? 'This username is already in use' : true,
    x => unknownNames.includes(x) ? 'This username is not known' : true
]

</script>

<template>
    <CustomInput ref="child" :tagId="$props.tagId" type="text" :rules="rules" v-bind="$attrs"/>
</template>