<script setup lang="ts">
import { currentAuthUser, currentUser, sendGuestLogin } from '@/socketWrapper/Login';
import { sendLogout } from '@/socketWrapper/Logout';
import { createRoomAndRedirect, currentRoom } from '@/socketWrapper/Room';
import { isDevelopment } from '@/misc/Globals';
import { watch } from 'vue';
import { v4 } from 'uuid';

function debugLogin() {
    sendGuestLogin(`debugUser${v4().substring(0, 5)}`)

    watch(currentAuthUser, () => {
        createRoomAndRedirect(`debugRoom${v4().substring(0, 5)}`)
    }, { once: true })
}

</script>


<template>
    <h1>Home</h1>

    <button @click="sendLogout" v-if="currentUser.status == 'logged in'">Logout</button>
    <button v-if="isDevelopment" @click="debugLogin" :disabled="currentAuthUser != undefined || currentRoom != undefined">
        Login and create debug room
    </button>
</template>