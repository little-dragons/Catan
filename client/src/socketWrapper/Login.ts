import type { LoginError, User } from "shared"
import { computed, readonly, ref } from "vue"
import { loginSocket } from "./Socket"

type CurrentUser =
    {
        status: 'logged in',
        user: User
    } 
    | {
        status: 'anonymous',
        lastRejectedLogin?: {
            request: User | 'login data request',
            error: LoginError
        }
    } 
    | {
        status: 'pending',
        request: User
    }

export const currentUserBacking = ref<CurrentUser>({ status: 'anonymous' })

export const currentUser = readonly(currentUserBacking)
export const currentAuthUser = computed(() => {
    if (currentUserBacking.value.status == 'logged in')
        return currentUserBacking.value.user
    else
        return undefined
})

export async function sendGuestLogin(name: string): Promise<void> {
    if (currentUserBacking.value.status != 'anonymous') {
        console.warn('User already logged in or login pending - ignoring new login request. Logout first.')
        return
    }

    const login: User = { type: 'guest', name: name}
    currentUserBacking.value = { status: 'pending', request: login }
    const res = await loginSocket.emitWithAck('guestLogin', name)

    if (res == 'name in use' || res == 'name not allowed')
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: res, request: login }}
    else
        currentUserBacking.value = { status: 'logged in', user: { name: name, type: 'guest' }}
}

export async function sendMemberLogin(name: string, password: string): Promise<void> {
    if (currentUserBacking.value.status != 'anonymous') {
        console.warn('User already logged in or login pending - ignoring new login request. Logout first.')
        return
    }

    const request: User = { type: 'member', name: name }
    currentUserBacking.value = { status: 'pending', request }

    const loginData = await loginSocket.emitWithAck('requestMemberLoginData', name)
    if (loginData == 'already logged in' || loginData == 'invalid socket state') {
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: loginData, request: 'login data request' } }
        return 
    }

    if (loginData == 'name unknown') {
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: 'name unknown', request } }
        return
    }

    const res = await loginSocket.emitWithAck('memberLogin', name, password, loginData)
    if (res == 'invalid socket state') 
        console.warn('rejected login because of invalid state, although client state is correct?')
    else if (res == 'invalid nonce')
        console.warn('invalid nonce sent in login?')
    else if (res == 'name unknown')
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: 'name unknown', request } }
    else if (res == 'invalid password')
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: 'invalid password', request } }
    currentUserBacking.value = { status: 'logged in', user: request}
}

export async function sendRegister(name: string, password: string) {
    if (currentUserBacking.value.status != 'anonymous') {
        console.warn('User already logged in or login pending - ignoring new register request. Logout first.')
        return
    }

    const request: User = { type: 'member', name: name, }
    currentUserBacking.value = { status: 'pending', request }
    const res = await loginSocket.emitWithAck('registerMember', name, password)
    if (res == 'invalid socket state')
        console.warn('rejected register because of invalid state, although client state is correct?')
    else if (res == 'name in use')
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: 'name in use', request } }
    else if (res == 'name not allowed')
        currentUserBacking.value = { status: 'anonymous', lastRejectedLogin: { error: 'name not allowed', request } }

    currentUserBacking.value = { status: 'logged in', user: request }
}

export async function logout() {
    if (currentUserBacking.value.status != 'logged in') {
        console.warn('User tried to logout, but not logged in')
        return
    }

    currentUserBacking.value = { status: 'anonymous' }
    const logout = await loginSocket.emitWithAck('logout')
    if (logout != true)
        console.warn(`Logout failed with: ${logout}`)
}
