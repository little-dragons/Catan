<script setup lang="ts">
import type { History } from 'shared';
import Tabs from '@/misc/Tabs.vue'
import Tab from '@/misc/Tab.vue'

defineProps<{
    history: History
}>()


</script>

<template>
    <Tabs>
        <Tab title="Overview">
            <p>Overview page</p>
        </Tab>
        <Tab title="Statistics">
            <p>Statistics page</p>
        </Tab>
    </Tabs>
</template>