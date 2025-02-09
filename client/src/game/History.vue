<script setup lang="ts">
import { Color, victoryPointsFromFull, type History } from 'shared';
import Tabs from '@/misc/Tabs.vue'
import Tab from '@/misc/Tab.vue'

const props = defineProps<{
    history: History
}>()

const state = props.history.lastState
const winner =  state.players.find(p => !state.players.some(p2 => victoryPointsFromFull(state, p2.color) > victoryPointsFromFull(state, p.color)))!
</script>

<template>
    <Tabs>
        <Tab title="Overview">
            <p>The winner is {{ Color[winner.color] }}</p>
        </Tab>
        <Tab title="Statistics">
            <p>Statistics page</p>
        </Tab>
    </Tabs>
</template>
