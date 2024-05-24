<script setup lang="ts">
import { currentAuthUser, currentUser } from '@/socketWrapper/Login';
import { sendLogout } from '@/socketWrapper/Logout';


</script>


<template>
    <h1>Home</h1>

    <button @click="sendLogout" v-if="currentUser.status == 'logged in'">Logout</button>
</template>
