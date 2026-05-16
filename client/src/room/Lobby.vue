<script setup lang="ts">
import Setting from './Setting.vue'
import { RoomMode, RoomOPResult, useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import router from '@/misc/Router';
import SideMenu from '@/misc/SideMenu.vue';
import { cssColor, participantName, ParticipantType, UserType, isValidSetting, type Settings, randomUnusedColor, unusedColors, Color } from 'catan-shared';
import { useTemplateRef } from 'vue';

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

function possibleColorSwitchesFor(user: Color) {
    if (currentRoom.isOwner)
        return unusedColors([ user ])

    if (user == currentRoom.ownColor)
        return unusedColors(currentRoom.info!.data.participants.filter(x => x.type == ParticipantType.User).map(x => x.color).concat([ user ]))

    return []
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
                <span>
                    <p :style="{ textDecoration: user.color == currentRoom.ownColor ? 'dotted underline' : 'none' }">
                        {{ participantName(user) }}
                    </p>
                    <p v-if="currentRoom.info?.mode == RoomMode.Online && currentRoom.info.data.owner.name == participantName(user)" 
                        :style="{ userSelect: 'none' }">
                        🛠️
                    </p>
                </span>
                <p>{{ user.type == ParticipantType.Bot ? 'Bot' : user.user.type == UserType.Member ? 'Member' : 'Guest' }}</p>
                <button 
                    :popovertarget="`${user.color}-popover`" 
                    class="color-icon"
                    :style="{ backgroundColor: cssColor(user.color) }"
                    :disabled="possibleColorSwitchesFor(user.color).length == 0">
                    {{ possibleColorSwitchesFor(user.color).length == 0 ? '' : '✎' }}
                </button>
                <div :id="`${user.color}-popover`" popover>
                    <button v-for="color in possibleColorSwitchesFor(user.color)" 
                        class="color-icon" 
                        :style="{ backgroundColor: cssColor(color) }"
                        :commandfor="`${user.color}-popover`"
                        command="hide-popover"
                        @click="() => currentRoom.tryChangeColor(user.color, color)"/>
                </div>
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

span {
    display: flex;
    gap: 10px;
}
span > p {
    margin: 0;
}

.color-icon {
    padding: 0;
    font-size: small;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 1.4rem;
    margin: auto;
    border: 1px black solid;
    user-select: none;
}

button:enabled {
    cursor: pointer;
}

:popover-open {
    transform: translateY(-90%);
    justify-self: anchor-center;
    align-self: anchor-center;
    display: flex;
    gap: 3px;    
    background-color: var(--secondary-background-color);
    border: var(--mute-border);
    border-radius: 3px;
    padding: 5px;
}
</style>
