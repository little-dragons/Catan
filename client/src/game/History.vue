<script setup lang="ts">
import { Color, type History, victoryPointsFromFull } from 'catan-shared';
import Tab from '@/misc/Tab.vue'
import Tabs from '@/misc/Tabs.vue'

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
