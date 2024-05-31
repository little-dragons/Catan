import { currentRoomBacking } from "./Room";
import { lobbySocket } from "./Socket";

export function acceptLobbyEvents() {
    lobbySocket.on('settingsChange', settings => {
        if (currentRoomBacking.value == undefined) {
            console.warn('User is in no room, but received settings change?')
            return
        }

        currentRoomBacking.value.settings = settings
    })
}