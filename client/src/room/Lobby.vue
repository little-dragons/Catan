<script setup lang="ts">
import Setting from './Setting.vue'
import { RoomMode, RoomOPResult, useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import router from '@/misc/Router';
import SideMenu from '@/misc/SideMenu.vue';
import { cssColor, participantName, ParticipantType, UserType, isValidSetting, type Settings } from 'catan-shared';

const currentRoom = useCurrentRoomStore()

async function tryStart() {
    const result = await currentRoom.tryStart()
    // TODO
}

async function changeSetting<Key extends keyof Settings>(key: Key, value: string) {
    const valid = isValidSetting(key, value)
    if (valid == undefined)
        return false


    const res = await currentRoom.tryChangeSetting(key, valid)
    return res == RoomOPResult.Success
}
</script>

<template>
    <h1 v-if="currentRoom.info?.mode == RoomMode.Online">Lobby - {{ currentRoom.info.data.name }}</h1>
    <h1 v-else-if="currentRoom.info?.mode == RoomMode.Offline">Lobby - Offline</h1>
    <div class="container">
        <div>            
            <div class="default-grid-header-layout grid-columns">
                <p>Name</p>
                <p>Type</p>
                <p>Color</p>
            </div>
            <div v-for="user in currentRoom.info?.data.participants" class="default-grid-layout grid-columns">
                <p>{{ participantName(user) }}</p>
                <p>{{ user.type == ParticipantType.Bot ? 'Bot' : user.user.type == UserType.Member ? 'Member' : 'Guest' }}</p>
                <p class="color-icon" :style="`background-color: ${cssColor(user.color)}`"></p>
            </div>
            <button 
                class="bot-button"
                :title="currentRoom.isOwner ? 'Add bot' : 'Only the owner can add a bot'"
                :disabled="!currentRoom.isOwner || currentRoom.info!.data.participants.length >= currentRoom.info!.data.scenario.players.maxAllowedCount"
                @click="currentRoom.tryAddBot()">
                Add bot
            </button>
        </div>
        <SideMenu>
            <Setting 
                name="Required victory points" 
                :initial="currentRoom.info!.data.settings.requiredVictoryPoints.toString()"
                :isValid="val => isValidSetting('requiredVictoryPoints', val) != undefined"
                :update="currentRoom.isOwner ? (val => changeSetting('requiredVictoryPoints', val)) : undefined"/>
            <Setting 
                name="Minimal longest road" 
                :initial="currentRoom.info!.data.settings.longestRoadMinimum.toString()"
                :isValid="val => isValidSetting('longestRoadMinimum', val) != undefined"
                :update="currentRoom.isOwner ? (val => changeSetting('longestRoadMinimum', val)) : undefined"/>
            <Setting 
                name="Seed" 
                :initial="currentRoom.info!.data.settings.seed"
                :isValid="val => isValidSetting('seed', val) != undefined"
                :update="currentRoom.isOwner ? (val => changeSetting('seed', val)) : undefined"/>

            <div class="buttons">
                <button @click="() => { router.push('/').then(currentRoom.tryLeave) }">Leave room</button>
                <button @click="tryStart" :disabled="!currentRoom.isOwner">Start room</button>
            </div>
        </SideMenu>
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

.grid-columns {
    grid-template-columns: 55% 35% 10%;
}

.buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.bot-button {
    width: 100%;
    margin: auto;
}

.color-icon {
    width: 1em;
    height: 1em;
    margin: auto;
    border-radius: 1em;
    border: 1px black solid;
}
</style>
