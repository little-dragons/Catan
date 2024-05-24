<script setup lang="ts">
import { currentAuthUser } from '@/socketWrapper/Login';
import { currentRoom, leaveRoomAndRedirect, startRoom } from '@/socketWrapper/Room';


if (currentRoom.value == undefined || currentAuthUser.value == undefined)
    alert('Invalid config')
</script>

<template>
    <p>Lobby</p>
    <button @click="() => leaveRoomAndRedirect()">Leave room</button>
    <button @click="() => startRoom()">Start room</button>
</template>
