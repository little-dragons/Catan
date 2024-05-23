<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue';
import { currentUser } from './socket/Login';
import LoginModal from './home/LoginModal.vue'

const showLoginModal = ref(false)

</script>

<template>
    <div class="navbar">
        <div>
            <RouterLink :to="{name: 'home'}">Home</RouterLink>
        </div>
        <div>
            <RouterLink :to="{name: 'roomList'}">Room List</RouterLink>
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
.navbar {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
}

p {
    margin: 0;
}


.login-button {
    text-decoration: underline;
    color: blueviolet;
}

.login-button:hover {
    cursor: pointer;
}
</style>