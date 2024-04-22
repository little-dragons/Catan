<script setup lang="ts">
import { defaultBoard } from './logic/Generation'
import BoardRenderer, { type BoardRendererExposes } from './drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from './drawing/board/Layout';
import { Color } from './logic/Player';
import { onMounted, ref, type Ref } from 'vue';
import { BuildingType } from './logic/Buildings';

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
board.buildings.push([Color.Green, [4,4], BuildingType.Settlement])

const renderer = ref(null) as Ref<null | (HTMLElement & BoardRendererExposes<string>)>
onMounted(() => {
    renderer.value!.setInteractionPoints([[[300, 300], 'test']], x => console.log(x[1]))
})

</script>

<template>
    <BoardRenderer ref="renderer" :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
</template>
