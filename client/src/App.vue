<script setup lang="ts">
import { RouterView } from 'vue-router'
import { currentUser } from './socketWrapper/Login';
import { currentLobbyRoom, currentRoom } from './socketWrapper/Room';
import {fetchNewState} from './socketWrapper/Game';
import { ref } from 'vue';
import LoginModal from './home/LoginModal.vue'

const showLoginModal = ref(false)

</script>

<template>
    <div class="navbar">
        <div>
            <RouterLink :to="{ name: 'home' }">Home</RouterLink>
        </div>
        <div>
            <RouterLink :to="{ name: 'roomList' }">Room List</RouterLink>
        </div>
        <div v-if="currentRoom != undefined">
            <RouterLink :to="{ name: 'room' }">Current room</RouterLink>
        </div>
        <div>
            <p v-if="currentUser.status == 'anonymous'">Not logged in. <span @click="() => showLoginModal = true" class="login-button">Login</span></p>
            <p v-else-if="currentUser.status == 'pending'">Pending login...</p>
            <p v-else-if="currentUser.status == 'logged in'">Logged in as {{ currentUser.user.name }}<span v-if="currentUser.user.isGuest"> (Guest)</span></p>
            <p v-else>Error with login!</p>
        </div>
    </div>

    <LoginModal v-if="showLoginModal" @close="() => showLoginModal = false"/>

    <main>
        <RouterView/>
    </main>
</template>

<style scoped>
@import 'assets/base.css';

.navbar {
    display: flex;
    flex-direction: row;
    gap: 4rem;
    background-color: var(--secondary-background-color);
    border-bottom: var(--mute-border);
    justify-content: flex-end;
    padding-right: 1rem;
    padding-left: 1rem;
}

.navbar > div {
    padding: 1rem 0;
}
.navbar > div > a {
    color: rgb(6, 6, 141);
    text-decoration: none;
}

p {
    margin: 0;
}

main {    
    padding: 0 40px;
}


.login-button {
    text-decoration: underline;
    color: blueviolet;
}

.login-button:hover {
    cursor: pointer;
}
</style>