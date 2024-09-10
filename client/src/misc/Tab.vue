<script setup lang="ts">
import { inject, provide, watch } from 'vue';
import { activeTabInjectKey } from './Tabs.vue';

defineProps<{
    title: string,
}>()


const activeTabTitle = inject(activeTabInjectKey)
</script>

<template>
    <div v-show="activeTabTitle == title">
        <slot/>
    </div>
</template>