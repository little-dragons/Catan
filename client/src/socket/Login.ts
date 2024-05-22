import type { AnyLogin, AuthUser, LoginError } from "shared"
import { ref, readonly, computed } from "vue"
import { loginSocket } from "./Socket"

export type CurrentUser = 
    {
        status: 'logged in',
        user: AuthUser
    } | {
        status: 'anonymous',
        lastRejectedLogin?: {
            request: AnyLogin,
            error: LoginError
        }
    } | {
        status: 'pending',
        login: AnyLogin
    }

const currentUserBacking = ref<CurrentUser>({ status: 'anonymous' })
export const currentUser = readonly(currentUserBacking)
export const currentAuthUser = computed(() => {
    const status = currentUserBacking.value
    if (status.status == 'logged in')
        return status.user
    else
        return undefined
})

export function sendLogin(login: AnyLogin) {
    if (currentUserBacking.value.status != 'anonymous') {
        console.warn('User already logged in or login pending - ignoring new login request. Logout first.')
        return
    }

    currentUserBacking.value = { status: 'pending', login }
    loginSocket.emit('login', login)
}

loginSocket.on('loggedIn', user => {
    if (currentUserBacking.value.status != 'pending') {
        console.warn('Received login while no login was pending. Discarding this data.')
        return
    }
    currentUserBacking.value = { status: 'logged in', user }
})

loginSocket.on('rejectLogin', error => {
    if (currentUserBacking.value.status != 'pending') {
        console.warn('Received that login was rejected while no login was pending. Discarding this data.')
        return
    }
    currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { request: currentUserBacking.value.login, error } }
})

export function sendLogout() {
    if (currentUserBacking.value.status != 'logged in') {
        console.warn('Cannot log out if user is not logged in. If the log in is pending, wait for it.')
        return
    }

    loginSocket.emit('logout', currentUserBacking.value.user.authToken)
    currentUserBacking.value = { status: 'anonymous' }
}