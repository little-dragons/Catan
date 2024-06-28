<script setup lang="ts">
import { validUsername } from 'shared';
import CustomInput from './CustomInput.vue'
import { computed, ref } from 'vue';

withDefaults(defineProps<{
    tagId?: string
    disabled?: boolean
}>(), { disabled: false })
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
    const res = validUsername(name)
    if (res == 'invalid tokens')
        return 'The name contains invalid tokens'
    else if (res == 'name too long')
        return 'The name is too long'
    else if (res == true)
        return true
    
    console.warn('Unhandled case in checking the username')
    return true
}
const rules: ((current: string) => true | string)[] = [
    x => uiMessageValidUsername(x),
    x => disallowedNames.includes(x) ? 'This username is not allowed' : true,
    x => namesInUse.includes(x) ? 'This username is already in use' : true,
    x => unknownNames.includes(x) ? 'This username is not known' : true
]

</script>

<template>
    <CustomInput ref="child" :tagId="$props.tagId" type="text" :rules="rules" :disabled="disabled"/>
</template>