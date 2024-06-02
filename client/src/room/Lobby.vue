<script setup lang="ts">
import { currentAuthUser } from '@/socketWrapper/Login';
import { leaveRoomAndRedirect, startRoom, currentLobbyRoom } from '@/socketWrapper/Room';
import Setting from './Setting.vue'


if (currentLobbyRoom.value == undefined || currentAuthUser.value == undefined)
    alert('Invalid config')
</script>

<template>
    <div v-if="currentLobbyRoom == undefined || currentAuthUser == undefined">
        <p>Invalid config, progamming error. Please reload the page.</p>
    </div>

    <h1 v-else>Lobby - {{ currentLobbyRoom?.name }}</h1>
    <div class="container">
        <div class="left">            
            <div class="default-grid-header-layout grid-columns">
                <p>User name</p>
            </div>
            <div v-for="user in currentLobbyRoom?.users" class="grid-columns default-grid-layout">
                <p>{{ user.name }}</p>
            </div>
        </div>
        <div class="right">
            <Setting name="requiredVictoryPoints" :value="currentLobbyRoom!.settings.requiredVictoryPoints" :allowChange="false"/>
            <Setting name="longestRoadMinimum" :value="currentLobbyRoom!.settings.longestRoadMinimum" :allowChange="false"/>
            <Setting name="seed" :value="currentLobbyRoom!.settings.seed" :allowChange="false"/>
            <div class="buttons">
                <button @click="leaveRoomAndRedirect">Leave room</button>
                <button @click="startRoom">Start room</button>
            </div>
        </div>
    </div>
    
</template>

<style scoped>
@import '../assets/base.css';

.container {
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 55% 38%;
    column-gap: 7%;
    margin-top: 30px;
}

.right {
    background-color: var(--secondary-background-color);
    border-radius: 10px;
    border: var(--mute-border);
    padding: 18px;
    width: calc(100% - 36px);
}

.right > *:not(:first-child) {
    margin-top: 15px;
}

.grid-columns {
    grid-template-columns: 50% 50%;
}

.buttons {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
}
</style>
