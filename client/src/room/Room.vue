<script setup lang="ts">
import { type Board } from 'shared';
import BoardRenderer, { type BoardRendererExposes } from '../drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from '../drawing/board/Layout';
import { ref, watch, type Ref } from 'vue';
import router from '@/misc/Router';
import { currentAuthUser, currentUser } from '@/socket/Login';
import { gameSocket } from '@/socket/Socket';

const board = ref(null) as Ref<null | Board>
const renderer = ref(null) as Ref<null | (HTMLElement & BoardRendererExposes<string>)>


if (currentUser.value.status == 'anonymous')
    router.push({ name: 'home' })


gameSocket.on('state', st => board.value = st.board)
watch(currentAuthUser, () => {
    if (currentAuthUser.value != undefined)
        gameSocket.emit('stateRequest', currentAuthUser.value.authToken)
}, { immediate: true })

// onMounted(() => {
    // renderer.value!.setInteractionPoints([[[300, 300], 'test']], x => console.log(x[1]))    
// })


</script>

<template>
    <BoardRenderer v-if="board != null" ref="renderer" :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
    <p v-else>Loading...</p>
</template>import { userLoginStatus, user } from '@/socket/User';
import { userLoginStatus, user } from '@/socket/User';

