import { type HonoSchema, type User, UserType } from 'catan-shared'
import type { Hono } from 'hono'
import { hc } from 'hono/client'
import type { BlankEnv } from 'hono/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { serverAddress } from '@/misc/Globals'
import { useCurrentRoomStore } from './CurrentRoomStore'

export enum UserStatus {
    LoggedIn,
    Anonymous,
    Pending
}

export type CurrentUserInfo = {
    status: UserStatus.LoggedIn,
    user: User
} | {
    status: UserStatus.Anonymous,
} | {
    status: UserStatus.Pending,
    request: User | undefined
}

export enum UserOPResult {
    Success,
    ServerDeniedLoginData,
    NotAnonymous,
    InvalidPassword,
    UnknownUsername,
    ForbiddenUsername,
    ServerError,
    InvalidInput,
    InRoom
}


const restClient = hc<Hono<BlankEnv, HonoSchema, '/'>>(serverAddress, {
    init: {
        credentials: 'include'
    }
})


export const useCurrentUserStore = defineStore('user', () => {
    const info = ref<CurrentUserInfo>({ status: UserStatus.Anonymous })
    const loggedInInfo = computed<User | undefined>(() => {
        if (info.value.status === UserStatus.LoggedIn)
            return info.value.user
        return undefined
    })

    async function tryGuestLogin(name: string) {
        if (info.value.status !== UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        
        const request = { type: UserType.Guest, name }
        info.value = {
            status: UserStatus.Pending,
            request
        }
        const res = await restClient.auth.login.guest.$post({ json: { username: name } })
        switch (res.status) {
            case 200: 
                info.value = { status: UserStatus.LoggedIn, user: request }
                return UserOPResult.Success
            case 400:
            case 409: 
                info.value = { status: UserStatus.Anonymous }
                return UserOPResult.ForbiddenUsername
        }
    }

    async function checkSession() {
        info.value = { status: UserStatus.Pending, request: undefined }
        
        const res = await restClient.auth.check.$post({})
        const d = await res.json()
        switch (d.code) {
            case 'ANONYMOUS':
                info.value = { status: UserStatus.Anonymous }
                return
            case 'SIGNEDIN':
                info.value = { status: UserStatus.LoggedIn, user: d.user }
                return
        }
    }

    async function tryMemberLogin(name: string, password: string) {

        if (info.value.status !== UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        const request = { type: UserType.Member, name }
        info.value = { status: UserStatus.Pending, request }

        const loginResult = await restClient.auth.login.member.$post({ json: { username: name, password }})
        switch (loginResult.status) {
            case 200: 
                info.value = { status: UserStatus.LoggedIn, user: request }
                return UserOPResult.Success
            case 400:
                info.value = { status: UserStatus.Anonymous }
                return UserOPResult.InvalidInput
            case 401:
                info.value = { status: UserStatus.Anonymous }
                switch ((await loginResult.json()).code) {
                    case "NAME_INVALID":
                        return UserOPResult.UnknownUsername
                    case "PASSWORD_INVALID":
                        return UserOPResult.InvalidPassword
                }
        }
    }

    async function tryRegister(name: string, password: string) {

        if (info.value.status !== UserStatus.Anonymous)
            return UserOPResult.NotAnonymous

        const request = { type: UserType.Member, name }
        info.value = {
            status: UserStatus.Pending,
            request
        }

        const result = await restClient.auth.register.$post({ json: { username: name, password }})
        switch (result.status) {
            case 200:
                info.value = { status: UserStatus.LoggedIn, user: request }
                return UserOPResult.Success
            case 400:
                info.value = { status: UserStatus.Anonymous }
                return UserOPResult.InvalidInput
            case 409:
                info.value = { status: UserStatus.Anonymous }
                return UserOPResult.ForbiddenUsername
            case 422:
                info.value = { status: UserStatus.Anonymous }
                return UserOPResult.ForbiddenUsername
        }
    }

    async function tryLogout() {
        if (info.value.status === UserStatus.Anonymous)
            return UserOPResult.Success

        
        // TODO: this could be done better.
        const currentRoom = useCurrentRoomStore()
        if (currentRoom.info !== undefined)
            return UserOPResult.InRoom

        await restClient.auth.logout.$post({})
        info.value = { status: UserStatus.Anonymous }
        return UserOPResult.Success
    }

    return { info, loggedInInfo, tryGuestLogin, tryMemberLogin, tryRegister, tryLogout, checkSession }
})
