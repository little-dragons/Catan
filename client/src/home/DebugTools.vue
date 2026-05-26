<script setup lang="ts">
import { type Board, Color, defaultScenario, GamePhaseType, generateBoardFromScenario, type History, Resource, randomSeed, TurnPhaseType } from 'catan-shared'
import { v4 } from 'uuid'
import { computed, ref } from 'vue'
import { useCurrentRoomStore } from '@/apiStores/CurrentRoomStore'
import { UserStatus, useCurrentUserStore } from '@/apiStores/CurrentUserStore'
import HistoryComponent from '@/game/History.vue'
import Container from '@/game-components/board/Container.vue'
import DefaultBoardItems from '@/game-components/board/DefaultBoardItems.vue'
import router from '@/misc/Router'
import { PopupSeverity, usePopups } from '@/popup/Popup'

const currentUser = useCurrentUserStore()
const currentRoom = useCurrentRoomStore()

async function debugLogin() {
    await currentUser.tryGuestLogin(`debugUser${v4().substring(0, 5)}`)
    await currentRoom.tryCreateOnline(`debugRoom${v4().substring(0, 5)}`)
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
            { color: Color.Blue, handCards: [Resource.Brick, Resource.Grain], devCards: [], knightsPlayed: 0 }, 
            { color: Color.Green, handCards: [Resource.Grain, Resource.Grain], devCards: [], knightsPlayed: 0 } ],
        longestRoad: undefined,
        knightForce: undefined
    }
}
const showHistory = ref(false)
const showBoardRenderer = ref(false)
const boardString = ref('')
const board = computed<Board | undefined>(() => boardString.value === '' ? undefined : JSON.parse(boardString.value))

</script>


<template>
    <button type="button" @click="currentUser.tryLogout" v-if="currentUser.info.status === UserStatus.LoggedIn">Logout</button>
    <button type="button" @click="debugLogin" :disabled="currentUser.info.status !== UserStatus.Anonymous || currentRoom.info !== undefined">
        Login and create debug room
    </button>
    <button type="button" @click="() => showHistory = !showHistory">
        Visit example history page.
    </button>
    <button type="button" @click="triggerNotification">
        Send test notification
    </button>
    <button type="button" @click="() => showBoardRenderer = !showBoardRenderer">
        Toggle board renderer
    </button>

    <HistoryComponent v-if="showHistory" :history="exampleHistory" />
    <textarea v-if="showBoardRenderer" v-model="boardString"/>
    <Container v-if="showBoardRenderer && board !== undefined" :tile-coordinates="board.tiles.map(x => x.coord)">
        <DefaultBoardItems :board="board"/>
    </Container>
</template>