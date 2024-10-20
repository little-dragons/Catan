<script setup lang="ts">
import { currentAuthUser, currentUser, sendGuestLogin } from '@/socketWrapper/Login';
import { sendLogout } from '@/socketWrapper/Logout';
import { createRoomAndRedirect, currentRoom } from '@/socketWrapper/Room';
import { isDevelopment } from '@/misc/Globals';
import { inject, ref, watch } from 'vue';
import { v4 } from 'uuid';
import { Color, defaultBoard, GamePhaseType, Resource, type History } from 'shared';
import HistoryComponent from '@/game/History.vue';
import { usePopups, PopupSeverity } from '@/popup/Popup';

function debugLogin() {
    sendGuestLogin(`debugUser${v4().substring(0, 5)}`)

    watch(currentAuthUser, () => {
        createRoomAndRedirect(`debugRoom${v4().substring(0, 5)}`)
    }, { once: true })
}

const { insert: insertPopup } = usePopups()

function triggerNotification() {
    insertPopup({
        message: 'This popup should automatically close',
        severity: PopupSeverity.Warning,
        title: 'Title',
        autoCloses: true
    })
    insertPopup({
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

    <button @click="sendLogout" v-if="currentUser.status == 'logged in'">Logout</button>
    <button v-if="isDevelopment" @click="debugLogin" :disabled="currentAuthUser != undefined || currentRoom != undefined">
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