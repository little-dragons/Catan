<script setup lang="ts">
import { UserType } from 'catan-shared'
import { RouterView } from 'vue-router'
import { useCurrentRoomStore } from './apiStores/CurrentRoomStore'
import { UserStatus, useCurrentUserStore } from './apiStores/CurrentUserStore'
import CreateRoomModal from './modals/CreateRoomModal.vue'
import LoginModal from './modals/LoginModal.vue'
import { loginModalID } from './modals/Modal.vue'
import Popups from './popup/Popups.vue'

const currentRoom = useCurrentRoomStore()
const currentUser = useCurrentUserStore()
</script>

<template>
    <div id="app">
        <div class="navbar">
            <div>
                <RouterLink :to="{ name: 'home' }">Home</RouterLink>
            </div>
            <div class="empty"/>
            <div>
                <RouterLink :to="{ name: 'scenarioEditor' }">Scenarios</RouterLink>
            </div>
            <div class="empty"/>
            <div>
                <RouterLink :to="{ name: 'roomList' }">Room List</RouterLink>
            </div>
            <div class="empty"/>
            <div v-if="currentRoom.info !== undefined">
                <RouterLink :to="{ name: 'room' }">Current room</RouterLink>
            </div>
            <div v-if="currentRoom.info !== undefined" class="empty"/>
            <div>
                <p v-if="currentUser.info.status === UserStatus.Anonymous">Not logged in. <button type="button" :commandfor="loginModalID" command="show-modal" class="login-button" title="Login">Login</button></p>
                <p v-else-if="currentUser.info.status === UserStatus.Pending">Pending login...</p>
                <p v-else-if="currentUser.info.status === UserStatus.LoggedIn">Logged in as {{ currentUser.info.user.name }}<span v-if="currentUser.info.user.type === UserType.Guest"> (Guest)</span></p>
                <p v-else>Error with login!</p>
            </div>
        </div>

        <Popups/>

        <main>
            <RouterView/>
        </main>
    </div>
    <!-- Modals live in the DOM permanently and are driven declaratively via `command`/`commandfor`. -->
    <div id="fragments">
        <LoginModal/>
        <CreateRoomModal/>
    </div>
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
    color: blueviolet;
    padding: 0;
    border: none;
    margin: 0;
    height: 100%;
    font-size: medium;
}

.login-button:hover {
    cursor: pointer;
}
</style>