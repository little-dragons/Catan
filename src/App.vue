<script setup lang="ts">
import { defaultBoard } from './logic/Generation'
import BoardRenderer from './components/BoardRenderer.vue'
import { minimalFillingTileRadius, type BoardRenderInfo } from './drawing/BoardRendering';

const board = defaultBoard(0)
</script>

<template>
    <BoardRenderer :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
</template>
