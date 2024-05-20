<script setup lang="ts">
import { validUsername } from 'shared';
import CustomInput from './CustomInput.vue'
import { computed, ref, shallowRef, type Ref } from 'vue';

defineProps<{
    tagId: string
}>()
const child = ref<null | InstanceType<typeof CustomInput>>(null)

const disallowedNames = [] as string[]
const namesInUse = [] as string[]




defineExpose({
    disallowName: (name: string) => {
        disallowedNames.push(name)
        child.value?.reevaluate()
    },
    nameInUse: (name: string) => {
        namesInUse.push(name)
        child.value?.reevaluate()
    },
    result: computed(() => child.value?.result ?? null)
})

const rules: ((current: string) => true | string)[] = [
    x => validUsername(x) ? true : 'The username does not meet the criteria',
    x => disallowedNames.includes(x) ? 'This username is not allowed' : true,
    x => namesInUse.includes(x) ? 'This username is already in use' : true
]

</script>

<template>
    <CustomInput ref="child" :tagId="$props.tagId" type="text" :rules="rules"/>
</template>