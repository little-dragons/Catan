<script setup lang="ts">
import { type Board } from 'shared';
import BoardRenderer, { type BoardRendererExposes } from '../drawing/board/Renderer.vue'
import { minimalFillingTileRadius } from '../drawing/board/Layout';
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import { UserKey, SocketKey, UserLoginStatusKey } from '@/InjectionKeys';
import router from '@/Router';

const board = ref(null) as Ref<null | Board>
const renderer = ref(null) as Ref<null | (HTMLElement & BoardRendererExposes<string>)>

const socket = inject(SocketKey)!
const user = inject(UserKey)!
const userLoginStatus = inject(UserLoginStatusKey)!

if (userLoginStatus.value[0] == 'anonymous')
    router.push({ name: 'home' })


socket.on('state', st => board.value = st.board)
watch(user, () => {
    if (user.value != undefined)
        socket.emit('stateRequest', user.value.authId)
}, { immediate: true })

// onMounted(() => {
    // renderer.value!.setInteractionPoints([[[300, 300], 'test']], x => console.log(x[1]))    
// })


</script>

<template>
    <BoardRenderer v-if="board != null" ref="renderer" :board="board" :tile-radius="minimalFillingTileRadius(board, 500, 500)" />
    <p v-else>Loading...</p>
</template>
