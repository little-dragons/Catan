<script setup lang="ts">
import { defaultBoard } from './logic/Generation'
import BoardRenderer from './drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from './drawing/board/Layout';

const board = defaultBoard(0)
</script>

<template>
    <BoardRenderer :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
</template>
