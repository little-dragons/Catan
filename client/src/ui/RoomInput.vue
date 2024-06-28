<script setup lang="ts">
import { validUsername } from 'shared';
import CustomInput from './CustomInput.vue'
import { computed, ref } from 'vue';

withDefaults(defineProps<{
    tagId?: string
    disabled?: boolean
}>(), { disabled: false })
const child = ref<null | InstanceType<typeof CustomInput>>(null)

const namesInUse = [] as string[]

defineExpose({
    nameInUse: (name: string) => {
        namesInUse.push(name)
        child.value?.reevaluate()
    },
    result: computed(() => child.value?.result ?? null)
})

const rules: ((current: string) => true | string)[] = [
    // TODO roomName check
    x => validUsername(x) ? true : 'The room name does not meet the criteria',
    x => namesInUse.includes(x) ? 'This room name is already in use' : true
]

</script>

<template>
    <CustomInput ref="child" :tagId="$props.tagId" type="text" :rules="rules" :disabled="disabled"/>
</template>