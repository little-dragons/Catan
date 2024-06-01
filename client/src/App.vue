<script setup lang="ts">
import { RouterView } from 'vue-router'
import { currentUser } from './socketWrapper/Login';
import { currentRoom } from './socketWrapper/Room';
import { ref } from 'vue';
import LoginModal from './home/LoginModal.vue'

const showLoginModal = ref(false)

</script>

<template>
    <div class="navbar">
        <div>
            <RouterLink :to="{ name: 'home' }">Home</RouterLink>
        </div>
        <div class="empty"/>
        <div>
            <RouterLink :to="{ name: 'roomList' }">Room List</RouterLink>
        </div>
        <div class="empty"/>
        <div v-if="currentRoom != undefined">
            <RouterLink :to="{ name: 'room' }">Current room</RouterLink>
        </div>
        <div v-if="currentRoom != undefined" class="empty"/>
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
    background-color: var(--secondary-background-color);
    border-bottom: var(--mute-border);
    justify-content: center;
    padding-right: 1rem;
    padding-left: 1rem;
}

.navbar > div {
    padding: 0.8rem 0;
    max-width: 15rem;
}
.navbar > div > a {
    color: rgb(6, 6, 141);
    text-decoration: none;
}

.empty {
    width: 4rem;
    min-width: 1rem;
}

.navbar > div > * {    
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0;
}

main {    
    margin: auto;
    width: fit-content;
    padding: 0 var(--main-side-padding);
}


.login-button {
    text-decoration: underline;
    color: blueviolet;
}

.login-button:hover {
    cursor: pointer;
}
</style>