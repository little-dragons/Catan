<script setup lang="ts">
import { currentAuthUser } from '@/socketWrapper/Login';
import { leaveRoomAndRedirect, startRoom, currentLobbyRoom } from '@/socketWrapper/Room';


if (currentLobbyRoom.value == undefined || currentAuthUser.value == undefined)
    alert('Invalid config')
</script>

<template>
    <h1>Lobby</h1>
    <button @click="() => leaveRoomAndRedirect()">Leave room</button>
    <button @click="() => startRoom()">Start room</button>
    <p v-for="user in currentLobbyRoom?.users">
        {{ user.name }}
    </p>
</template>
