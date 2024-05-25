<script setup lang="ts" generic="SettingsKey extends keyof Settings">
import type { Settings } from 'shared/logic/Settings';
import type { DeepReadonly, Ref } from 'vue';

const props = defineProps<{
    name: SettingsKey
    value: Settings[SettingsKey]
    allowChange: false | ((newVal: Settings[SettingsKey]) => void)
}>()

const displayName = 
    props.name == 'requiredVictoryPoints' ? 'Required victory points' :
    props.name == 'longestRoadMinimum' ? 'Minimum roads for longest road' :
    undefined!

</script>

<template>
    <div>
        <span>{{ displayName }}:</span>
        <span>{{ value }}</span>
    </div>
</template>

<style scoped>
div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

div:last-child {
    justify-self: end;
}
</style>