<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SocketKey, UserLoginStatusKey } from './InjectionKeys';
import { inject, ref } from 'vue';
import LoginModal from './home/LoginModal.vue'

const socket = inject(SocketKey)!
const userLoginStatus = inject(UserLoginStatusKey)!

const showLoginModal = ref(false)

function logout() {
    if (userLoginStatus.value[0] == 'logged in') {
        socket.emit('logout', userLoginStatus.value[1].authId)
        userLoginStatus.value = ['anonymous']
    }
}

</script>

<template>
    <div>
        <p v-if="userLoginStatus[0] == 'anonymous'">Not logged in. <span @click="() => showLoginModal = true" class="login-button">Login</span></p>
        <p v-else-if="userLoginStatus[0] == 'pending'">Pending login...</p>
        <p v-else-if="userLoginStatus[0] == 'logged in'">Logged in as {{ userLoginStatus[1].name }}<span v-if="userLoginStatus[1].isGuest"> (Guest)</span></p>
        <p v-else>Error with login!</p>
    </div>

    <LoginModal v-if="showLoginModal" @close="() => showLoginModal = false"/>
    <button @click="logout" v-if="userLoginStatus[0] == 'logged in'">Logout</button>

    <RouterView />
</template>

<style scoped>
.login-button {
    text-decoration: underline;
    color: blueviolet;
}

.login-button:hover {
    cursor: pointer;
}
</style>