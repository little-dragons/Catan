import type { ClientEventMap, GuestLogin, MemberLogin, ServerEventMap, UserWithAuth } from "shared";
import type { Socket } from "socket.io-client";
import type { InjectionKey, Ref } from "vue";

export const SocketKey = Symbol() as InjectionKey<Socket<ClientEventMap, ServerEventMap>>
export const UserKey = Symbol() as InjectionKey<Ref<UserWithAuth | undefined>>

export type UserLoginStatus = ['logged in', UserWithAuth] | ['anonymous'] | ['pending', GuestLogin | MemberLogin]
export const UserLoginStatusKey = Symbol() as InjectionKey<Ref<UserLoginStatus>>
