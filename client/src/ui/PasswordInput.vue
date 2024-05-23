<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import CustomInput from './CustomInput.vue'

defineProps<{
    tagId?: string
}>()
const child = ref<null | InstanceType<typeof CustomInput>>(null)


const rules: ((current: string) => true | string)[] = [
    x => 'Passwords are not implemented'
]

defineExpose({
    result: computed(() => child.value?.result ?? null)
})


</script>

<template>
    <CustomInput ref="child":id="$props.tagId" type="password" :rules="rules"/>
</template>