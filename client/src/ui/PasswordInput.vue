<script setup lang="ts">
import { computed, ref } from 'vue';
import CustomInput from './CustomInput.vue'
import { validPassword } from 'shared';

defineProps<{
    tagId?: string
}>()

defineExpose({
    invalidPassword: (password: string) => {
        invalidPasswords.push(password)
        child.value?.reevaluate()
    },
    result: computed(() => child.value?.result ?? null)
})

const child = ref<null | InstanceType<typeof CustomInput>>(null)

const invalidPasswords = [] as string[]
function uiMessageValidPassword(password: string) {
    const res = validPassword(password)
    if (res == 'contains invalid characters')
        return 'Some characters are not allowed' // TODO
    if (res == 'password too short')
        return 'The password is too short'

    return true
}

const rules: ((current: string) => true | string)[] = [
    x => uiMessageValidPassword(x),
    x => invalidPasswords.includes(x) ? 'This password is invalid' : true
]

</script>

<template>
    <CustomInput ref="child":id="$props.tagId" type="password" :rules="rules" v-bind="$attrs"/>
</template>