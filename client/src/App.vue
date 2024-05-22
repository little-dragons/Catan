<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue';
import { currentUser, sendLogout } from './socket/Login';
import LoginModal from './home/LoginModal.vue'

const showLoginModal = ref(false)

</script>

<template>
    <div>
        <p v-if="currentUser.status == 'anonymous'">Not logged in. <span @click="() => showLoginModal = true" class="login-button">Login</span></p>
        <p v-else-if="currentUser.status == 'pending'">Pending login...</p>
        <p v-else-if="currentUser.status == 'logged in'">Logged in as {{ currentUser.user.name }}<span v-if="currentUser.user.isGuest"> (Guest)</span></p>
        <p v-else>Error with login!</p>
    </div>

    <LoginModal v-if="showLoginModal" @close="() => showLoginModal = false"/>
    <button @click="sendLogout" v-if="currentUser.status == 'logged in'">Logout</button>

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