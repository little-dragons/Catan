<script setup lang="ts">
import Setting from './Setting.vue'
import { RoomOPResult, useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import router from '@/misc/Router';
import { isValidSetting, type Settings } from 'shared/logic/Settings';
import SideMenu from '@/misc/SideMenu.vue';

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
    <h1>Lobby - {{ currentRoom.info!.name }}</h1>
    <div class="container">
        <div>            
            <div class="default-grid-header-layout grid-columns">
                <p>User name</p>
            </div>
            <div v-for="user in currentRoom.info?.users" class="grid-columns default-grid-layout">
                <p>{{ user[0].name }}</p>
            </div>
        </div>
        <SideMenu>
            <Setting 
                name="Required victory points" 
                :initial="currentRoom.info!.settings.requiredVictoryPoints.toString()"
                :isValid="(val) => isValidSetting('requiredVictoryPoints', val) != undefined"
                :update="currentRoom.isOwner ? ((val) => changeSetting('requiredVictoryPoints', val)) : undefined"/>
            <Setting 
                name="Minimal longest road" 
                :initial="currentRoom.info!.settings.longestRoadMinimum.toString()"
                :isValid="(val) => isValidSetting('longestRoadMinimum', val) != undefined"
                :update="currentRoom.isOwner ? ((val) => changeSetting('longestRoadMinimum', val)) : undefined"/>
            <Setting 
                name="Seed" 
                :initial="currentRoom.info!.settings.seed"
                :isValid="(val) => isValidSetting('seed', val) != undefined"
                :update="currentRoom.isOwner ? ((val) => changeSetting('seed', val)) : undefined"/>

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
    grid-template-columns: 50% 50%;
}

.buttons {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
}
</style>
