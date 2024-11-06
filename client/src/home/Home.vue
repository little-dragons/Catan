<script setup lang="ts">
import { isDevelopment } from '@/misc/Globals';
import { ref } from 'vue';
import { v4 } from 'uuid';
import { Color, defaultBoard, GamePhaseType, Resource, type History } from 'shared';
import HistoryComponent from '@/game/History.vue';
import { usePopups, PopupSeverity } from '@/popup/Popup';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import { useCurrentUserStore, UserStatus } from '@/socket/CurrentUserStore';
import router from '@/misc/Router';

const currentUser = useCurrentUserStore()
const currentRoom = useCurrentRoomStore()

async function debugLogin() {
    await currentUser.tryGuestLogin(`debugUser${v4().substring(0, 5)}`)
    await currentRoom.tryCreate(`debugRoom${v4().substring(0, 5)}`)
    router.push({ name: 'room' })
}

const popups = usePopups()

function triggerNotification() {
    popups.insert({
        message: 'This popup should automatically close',
        severity: PopupSeverity.Warning,
        title: 'Title',
        autoCloses: true
    })
    popups.insert({
        message: 'This popup should NOT automatically close',
        severity: PopupSeverity.Error,
        title: 'Title2',
        autoCloses: false
    })
}

const exampleHistory: History = {
    lastState: {
        board: defaultBoard('default'),
        currentPlayer: Color.Blue,
        phase: {
            diceRolled: [5, 5],
            type: GamePhaseType.Normal,
            tradeOffers: []
        },
        players: [ 
            { color: Color.Blue, handCards: [Resource.Brick, Resource.Grain] }, 
            { color: Color.Green, handCards: [Resource.Grain, Resource.Grain] } ]
    }
}
const showHistory = ref(false)
</script>


<template>
    <h1>Home</h1>

    <button @click="currentUser.tryLogout" v-if="currentUser.info.status == UserStatus.LoggedIn">Logout</button>
    <button v-if="isDevelopment" @click="debugLogin" :disabled="currentUser.info.status != UserStatus.Anonymous || currentRoom.info != undefined">
        Login and create debug room
    </button>
    <button v-if="isDevelopment" @click="() => showHistory = !showHistory">
        Visit example history page.
    </button>
    <button v-if="isDevelopment" @click="triggerNotification">
        Send test notification
    </button>
    <HistoryComponent v-if="showHistory" :history="exampleHistory" />
</template>