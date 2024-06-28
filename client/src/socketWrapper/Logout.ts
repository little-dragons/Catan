import { currentUserBacking } from "./Login"
import { currentRoom, leaveRoomAndRedirect } from "./Room"
import { loginSocket } from "./Socket"


// this file exists to split up the circular dependency between room and login
// which would otherwise exist

export async function sendLogout() {
    if (currentUserBacking.value.status != 'logged in') {
        console.warn('Cannot log out if user is not logged in. If the log in is pending, wait for it.')
        return
    }

    if (currentRoom.value != undefined) {
        console.warn('User is trying to logout, but still contained in a room. Logging out as a precaution')
        leaveRoomAndRedirect()
    }

    const res  = await loginSocket.emitWithAck('logout')
    // TODO possibly alert?
    currentUserBacking.value = { status: 'anonymous' }
}
