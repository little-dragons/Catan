<script setup lang="ts">
import Setting from './Setting.vue'
import { watchEffect } from 'vue';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import { useCurrentUserStore } from '@/socket/CurrentUserStore';
import router from '@/misc/Router';

const currentUser = useCurrentUserStore()
const currentRoom = useCurrentRoomStore()

async function tryStart() {
    const result = await currentRoom.tryStart()
    // TODO
}
</script>

<template>
    <h1>Lobby - {{ currentRoom.info!.name }}</h1>
    <div class="container">
        <div class="left">            
            <div class="default-grid-header-layout grid-columns">
                <p>User name</p>
            </div>
            <div v-for="user in currentRoom.info?.users" class="grid-columns default-grid-layout">
                <p>{{ user[0].name }}</p>
            </div>
        </div>
        <div class="right">
            <Setting name="requiredVictoryPoints" :value="currentRoom.info!.settings.requiredVictoryPoints" :allowChange="false"/>
            <Setting name="longestRoadMinimum" :value="currentRoom.info!.settings.longestRoadMinimum" :allowChange="false"/>
            <Setting name="seed" :value="currentRoom.info!.settings.seed" :allowChange="false"/>
            <div class="buttons">
                <button @click="() => { router.push('/').then(currentRoom.tryLeave) }">Leave room</button>
                <button @click="tryStart" :disabled="currentRoom.info!.owner.name != currentUser.loggedInInfo!.name">Start room</button>
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
