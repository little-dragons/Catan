import { defineStore } from "pinia"
import { type User, UserType } from "shared"
import { ref, computed } from "vue"
import { socket } from "./Socket"
import { useCurrentRoomStore } from "./CurrentRoomStore"

export enum UserStatus {
    LoggedIn,
    Anonymous,
    Pending
}

export type CurrentUserInfo =
    {
        status: UserStatus.LoggedIn,
        user: User
    }
    | {
        status: UserStatus.Anonymous,
    }
    | {
        status: UserStatus.Pending,
        request: User
    }

export enum UserOPResult {
    Success,
    ServerDeniedLoginData,
    NotAnonymous,
    InvalidPassword,
    UnknownUsername,
    ForbiddenUsername,
    ServerError
}

export const useCurrentUserStore = defineStore('user', () => {
    const info = ref<CurrentUserInfo>({ status: UserStatus.Anonymous })
    const loggedInInfo = computed<User | undefined>(() => {
        if (info.value.status == UserStatus.LoggedIn)
            return info.value.user
        return undefined
    })

    async function tryGuestLogin(name: string): Promise<
        UserOPResult.Success | UserOPResult.NotAnonymous |
        UserOPResult.ForbiddenUsername | UserOPResult.ServerError> {

        if (info.value.status != UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        const request = { type: UserType.Guest, name }
        info.value = {
            status: UserStatus.Pending,
            request
        }
        const res = await socket.emitWithAck('guestLogin', name)

        if (res == 'invalid socket state') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ServerError
        }
        if (res == 'name in use' || res == 'name not allowed') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ForbiddenUsername
        }

        const _assert: true = res

        info.value = {
            status: UserStatus.LoggedIn,
            user: request
        }

        return UserOPResult.Success
    }

    async function tryMemberLogin(name: string, password: string): Promise<
        UserOPResult.Success | UserOPResult.NotAnonymous |
        UserOPResult.ServerDeniedLoginData | UserOPResult.InvalidPassword |
        UserOPResult.UnknownUsername | UserOPResult.ServerError> {

        if (info.value.status != UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        const request = { type: UserType.Member, name }
        info.value = { status: UserStatus.Pending, request }

        const loginData = await socket.emitWithAck('requestMemberLoginData', name)
        if (loginData == 'already logged in' || loginData == 'invalid socket state') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ServerError
        }

        if (loginData == 'name unknown') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.UnknownUsername
        }

        const loginResult = await socket.emitWithAck('memberLogin', name, password, loginData)

        if (loginResult == 'invalid nonce' || loginResult == 'invalid socket state') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ServerError
        }

        if (loginResult == 'invalid password') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.InvalidPassword
        }

        if (loginResult == 'name unknown') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.UnknownUsername
        }

        const _assert: true = loginResult
        info.value = {
            status: UserStatus.LoggedIn,
            user: request
        }
        return UserOPResult.Success
    }

    async function tryRegister(name: string, password: string): Promise<
        UserOPResult.ForbiddenUsername | UserOPResult.Success |
        UserOPResult.NotAnonymous | UserOPResult.ServerError> {

        if (info.value.status != UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        const request = { type: UserType.Member, name }
        info.value = {
            status: UserStatus.Pending,
            request
        }
        const result = await socket.emitWithAck('registerMember', name, password)
        if (result == 'invalid socket state') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ServerError
        }

        if (result == 'name in use' || result == 'name not allowed') {
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.ForbiddenUsername
        }

        const _assert: true = result
        info.value = {
            status: UserStatus.LoggedIn,
            user: request
        }
        return UserOPResult.Success
    }

    async function tryLogout(): Promise<
        UserOPResult.ServerError | UserOPResult.Success> {

        if (info.value.status == UserStatus.Anonymous)
            return UserOPResult.Success

        // TODO pending
        if (info.value.status == UserStatus.LoggedIn) {
            const currentRoom = useCurrentRoomStore()
            await currentRoom.tryLeave()
            const res = await socket.emitWithAck('logout')
            if (res == 'invalid socket state')
                return UserOPResult.ServerError

            const _assert: true = res
            info.value = { status: UserStatus.Anonymous }
            return UserOPResult.Success
        }

        info.value = { status: UserStatus.Anonymous }
        return UserOPResult.Success
    }

    return { info, loggedInInfo, tryGuestLogin, tryMemberLogin, tryRegister, tryLogout }
})
