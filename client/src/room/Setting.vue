<script setup lang="ts" generic="SettingsKey extends keyof Settings">
import type { Settings } from 'shared/logic/Settings';

const props = defineProps<{
    name: SettingsKey
    value: Settings[SettingsKey]
    allowChange: false | ((newVal: Settings[SettingsKey]) => void)
}>()

const displayName = 
    props.name == 'requiredVictoryPoints' ? 'Required victory points' :
    props.name == 'longestRoadMinimum' ? 'Minimal longest road' :
    props.name == 'seed' ? 'Seed' :
    undefined!

</script>

<template>
    <div>
        <span class="descriptor">{{ displayName }}:</span>
        <span class="value">{{ value }}</span>
    </div>
</template>

<style scoped>
div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
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
</style>