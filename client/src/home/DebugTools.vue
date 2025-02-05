<script setup lang="ts">
import { ref } from 'vue';
import { v4 } from 'uuid';
import { Color, defaultScenario, GamePhaseType, generateBoardFromScenario, Resource, TurnPhaseType, type History } from 'shared';
import HistoryComponent from '@/game/History.vue';
import { usePopups, PopupSeverity } from '@/popup/Popup';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import { useCurrentUserStore, UserStatus } from '@/socket/CurrentUserStore';
import router from '@/misc/Router';
import BoardRenderer from '@/game/gameDrawing/board/Renderer.vue';

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
        board: generateBoardFromScenario(defaultScenario.board, 'default')!,
        currentPlayer: Color.Blue,
        phase: {
            type: GamePhaseType.Turns,
            subtype: TurnPhaseType.Active,
            tradeOffers: []
        },
        devCards: {
            knights: 10,
            monopoly: 4,
            roadBuilding: 3,
            victoryPoints: 2,
            yearOfPlenty: 2
        },
        players: [ 
            { color: Color.Blue, handCards: [Resource.Brick, Resource.Grain], devCards: [] }, 
            { color: Color.Green, handCards: [Resource.Grain, Resource.Grain], devCards: [] } ],
        longestRoad: undefined
    }
}
const showHistory = ref(false)
const showBoardRenderer = ref(false)
const boardString = ref('')
</script>


<template>
    <button @click="currentUser.tryLogout" v-if="currentUser.info.status == UserStatus.LoggedIn">Logout</button>
    <button @click="debugLogin" :disabled="currentUser.info.status != UserStatus.Anonymous || currentRoom.info != undefined">
        Login and create debug room
    </button>
    <button @click="() => showHistory = !showHistory">
        Visit example history page.
    </button>
    <button @click="triggerNotification">
        Send test notification
    </button>
    <button @click="() => showBoardRenderer = !showBoardRenderer">
        Toggle board renderer
    </button>

    <HistoryComponent v-if="showHistory" :history="exampleHistory" />
    <textarea v-if="showBoardRenderer" v-model="boardString"/>
    <BoardRenderer v-if="showBoardRenderer && boardString != ''" :board="JSON.parse(boardString)"/>
</template>