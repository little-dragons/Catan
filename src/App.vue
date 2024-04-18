<script setup lang="ts">
import { defaultBoard } from './logic/Generation'
import BoardRenderer from './drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from './drawing/board/Layout';
import { Color } from './logic/Player';

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
</script>

<template>
    <BoardRenderer :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
</template>
