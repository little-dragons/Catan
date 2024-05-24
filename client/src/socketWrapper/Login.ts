import type { AnyLogin, AuthUser, LoginError } from "shared"
import { computed, readonly, ref } from "vue"
import { loginSocket } from "./Socket"

type CurrentUser =
    {
        status: 'logged in',
        user: AuthUser
    } 
    | {
        status: 'anonymous',
        lastRejectedLogin?: {
            request: AnyLogin,
            error: LoginError
        }
    } 
    | {
        status: 'pending',
        login: AnyLogin
    }

export const currentUserBacking = ref<CurrentUser>({ status: 'anonymous' })

export const currentUser = readonly(currentUserBacking)
export const currentAuthUser = computed(() => {
    if (currentUserBacking.value.status == 'logged in')
        return currentUserBacking.value.user
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


export function acceptLoginEvents() {
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
}