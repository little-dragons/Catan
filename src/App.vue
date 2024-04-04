<script setup lang="ts">
import { defaultBoard } from './logic/Generation'
import BoardRenderer from './components/BoardRenderer.vue'
</script>

<template>
    <BoardRenderer :board="defaultBoard(0)" />
</template>

<style scoped></style>
